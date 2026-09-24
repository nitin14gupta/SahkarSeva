from db.config import get_db


def create_ticket(user_id: str, booking_id: str | None, subject: str, message: str) -> dict:
    with get_db() as (cur, conn):
        cur.execute(
            """
            INSERT INTO support_tickets (user_id, booking_id, subject, message)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, booking_id, subject, message),
        )
        return dict(cur.fetchone())


def list_tickets(user_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            "SELECT * FROM support_tickets WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        )
        return [dict(row) for row in cur.fetchall()]
