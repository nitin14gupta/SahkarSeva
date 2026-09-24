from db.config import get_db


def create_notification(cur, user_id: str, title: str, body: str | None, type_: str = "general", booking_id: str | None = None) -> None:
    """Inserts a notification row using an already-open cursor, so it commits
    atomically with whatever triggered it (a booking transition, etc)."""
    cur.execute(
        """
        INSERT INTO notifications (user_id, title, body, type, booking_id)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (user_id, title, body, type_, booking_id),
    )


def list_notifications(user_id: str, limit: int = 50) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT id, title, body, type, booking_id, is_read, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (user_id, limit),
        )
        return [dict(row) for row in cur.fetchall()]


def get_unread_count(user_id: str) -> int:
    with get_db() as (cur, conn):
        cur.execute(
            "SELECT count(*) AS count FROM notifications WHERE user_id = %s AND is_read = false",
            (user_id,),
        )
        return cur.fetchone()["count"]


def mark_read(user_id: str, notification_id: str) -> bool:
    with get_db() as (cur, conn):
        cur.execute(
            "UPDATE notifications SET is_read = true WHERE id = %s AND user_id = %s RETURNING id",
            (notification_id, user_id),
        )
        return cur.fetchone() is not None


def mark_all_read(user_id: str) -> None:
    with get_db() as (cur, conn):
        cur.execute("UPDATE notifications SET is_read = true WHERE user_id = %s AND is_read = false", (user_id,))
