import asyncio
import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from db.config import get_db
from services import auth_service
from services.chat_ws import add_socket, broadcast, remove_socket, serialize_message

router = APIRouter(tags=["chat"])


def _is_participant(cur, booking_id: str, user_id: str) -> bool:
    cur.execute(
        """
        SELECT 1 FROM bookings b
        JOIN workers w ON w.id = b.worker_id
        WHERE b.id = %s AND (b.customer_id = %s OR w.user_id = %s)
        """,
        (booking_id, user_id, user_id),
    )
    return cur.fetchone() is not None


@router.websocket("/ws/chat/{booking_id}")
async def chat_websocket(booking_id: str, websocket: WebSocket, token: str = Query(...)):
    try:
        user_id = auth_service.decode_token(token)
    except Exception:
        await websocket.close(code=4001)
        return

    with get_db() as (cur, conn):
        if not _is_participant(cur, booking_id, user_id):
            await websocket.close(code=4003)
            return

    await websocket.accept()
    add_socket(booking_id, websocket)

    try:
        while True:
            try:
                raw = await asyncio.wait_for(websocket.receive_text(), timeout=25.0)
            except asyncio.TimeoutError:
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            elif msg_type == "typing":
                await broadcast(
                    booking_id,
                    {"type": "typing", "user_id": user_id, "is_typing": bool(data.get("is_typing"))},
                    exclude=websocket,
                )

            elif msg_type == "read":
                with get_db() as (cur, conn):
                    cur.execute(
                        """
                        UPDATE chat_messages SET read_at = now()
                        WHERE booking_id = %s AND sender_id != %s AND read_at IS NULL
                        """,
                        (booking_id, user_id),
                    )
                    conn.commit()
                await broadcast(booking_id, {"type": "read", "user_id": user_id})

            elif msg_type == "message":
                content = (data.get("content") or "").strip()
                if not content:
                    continue
                with get_db() as (cur, conn):
                    cur.execute(
                        """
                        INSERT INTO chat_messages (booking_id, sender_id, message)
                        VALUES (%s, %s, %s)
                        RETURNING id, sender_id, message, read_at, created_at
                        """,
                        (booking_id, user_id, content),
                    )
                    row = dict(cur.fetchone())
                payload = serialize_message(row)
                await websocket.send_text(json.dumps(payload))
                await broadcast(booking_id, payload, exclude=websocket)

    except WebSocketDisconnect:
        pass
    finally:
        remove_socket(booking_id, websocket)
