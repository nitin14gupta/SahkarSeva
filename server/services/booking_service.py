from db.config import get_db


def list_bookings(customer_id: str, status: str | None = None) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT b.id, b.status, b.scheduled_date, b.scheduled_time, b.is_emergency,
                   b.price_estimate, b.notes, b.cancelled_reason, b.created_at,
                   w.id AS worker_id, u.name AS worker_name, u.photo_url AS worker_photo_url,
                   cat.name AS category
            FROM bookings b
            JOIN workers w ON w.id = b.worker_id
            JOIN users u ON u.id = w.user_id
            JOIN categories cat ON cat.id = b.category_id
            WHERE b.customer_id = %(customer_id)s
              AND (%(status)s IS NULL OR b.status = %(status)s)
            ORDER BY b.created_at DESC
            """,
            {"customer_id": customer_id, "status": status},
        )
        return [dict(row) for row in cur.fetchall()]


def create_booking(
    customer_id: str,
    worker_id: str,
    category_name: str,
    address_id: str | None,
    scheduled_date: str | None,
    scheduled_time: str | None,
    notes: str | None,
    photo_url: str | None,
    is_emergency: bool,
) -> dict:
    with get_db() as (cur, conn):
        cur.execute("SELECT id FROM categories WHERE name = %s", (category_name,))
        category = cur.fetchone()
        if not category:
            raise ValueError(f"Unknown category '{category_name}'")

        cur.execute("SELECT price_min FROM workers WHERE id = %s", (worker_id,))
        worker = cur.fetchone()
        if not worker:
            raise ValueError("Worker not found")
        price_estimate = worker["price_min"]

        cur.execute(
            """
            INSERT INTO bookings (
                customer_id, worker_id, category_id, address_id,
                scheduled_date, scheduled_time, notes, photo_url,
                is_emergency, price_estimate
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                customer_id, worker_id, category["id"], address_id, scheduled_date,
                scheduled_time, notes, photo_url, is_emergency, price_estimate,
            ),
        )
        booking = dict(cur.fetchone())

        if scheduled_date and scheduled_time:
            cur.execute(
                """
                UPDATE worker_availability_slots
                SET is_booked = true
                WHERE worker_id = %s AND slot_date = %s AND start_time = %s
                """,
                (worker_id, scheduled_date, scheduled_time),
            )

        return booking


def cancel_booking(booking_id: str, customer_id: str, reason: str | None) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            UPDATE bookings
            SET status = 'cancelled', cancelled_reason = %s, updated_at = now()
            WHERE id = %s AND customer_id = %s AND status NOT IN ('completed', 'cancelled')
            RETURNING *
            """,
            (reason, booking_id, customer_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def get_booking(booking_id: str, customer_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT b.*, w.id AS worker_id, u.name AS worker_name, u.photo_url AS worker_photo_url,
                   cat.name AS category, a.line1 AS address_line1, a.city AS address_city
            FROM bookings b
            JOIN workers w ON w.id = b.worker_id
            JOIN users u ON u.id = w.user_id
            JOIN categories cat ON cat.id = b.category_id
            LEFT JOIN addresses a ON a.id = b.address_id
            WHERE b.id = %s AND b.customer_id = %s
            """,
            (booking_id, customer_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None
