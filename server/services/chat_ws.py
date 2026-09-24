"""In-memory WebSocket room registry for booking chat — single-process only,
no Redis. Good enough for one dev/small-deployment server; if this ever runs
behind multiple worker processes, cross-process delivery would need a
pub/sub layer (Redis or similar) added here."""
import json

from fastapi import WebSocket

_rooms: dict[str, set[WebSocket]] = {}


def _room(booking_id: str) -> set[WebSocket]:
    return _rooms.setdefault(booking_id, set())


def add_socket(booking_id: str, ws: WebSocket) -> None:
    _room(booking_id).add(ws)


def remove_socket(booking_id: str, ws: WebSocket) -> None:
    _room(booking_id).discard(ws)


async def broadcast(booking_id: str, data: dict, exclude: WebSocket | None = None) -> None:
    dead = set()
    for ws in list(_room(booking_id)):
        if ws is exclude:
            continue
        try:
            await ws.send_text(json.dumps(data))
        except Exception:
            dead.add(ws)
    _rooms[booking_id] -= dead


def serialize_message(row: dict) -> dict:
    return {
        "type": "message",
        "id": str(row["id"]),
        "sender_id": str(row["sender_id"]),
        "message": row["message"],
        "read_at": row["read_at"].isoformat() if row.get("read_at") else None,
        "created_at": row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else row["created_at"],
    }
