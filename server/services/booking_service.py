from db.config import get_db
from services.worker_service import get_worker_id_for_user


GROUP_STATUSES = {
    "upcoming": ["requested", "accepted", "en_route", "in_progress"],
    "past": ["completed"],
    "cancelled": ["cancelled"],
}

WORKER_GROUP_STATUSES = {
    "incoming": ["requested"],
    "active": ["accepted", "en_route", "in_progress"],
    "history": ["completed", "cancelled"],
}


def list_bookings(customer_id: str, status: str | None = None, group: str | None = None) -> list[dict]:
    statuses = GROUP_STATUSES.get(group) if group else ([status] if status else None)
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
              AND (%(statuses)s IS NULL OR b.status = ANY(%(statuses)s))
            ORDER BY b.created_at DESC
            """,
            {"customer_id": customer_id, "statuses": statuses},
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


def create_emergency_booking(
    customer_id: str, category_name: str, address_id: str | None, lat: float, lng: float
) -> dict:
    with get_db() as (cur, conn):
        cur.execute("SELECT id FROM categories WHERE name = %s", (category_name,))
        category = cur.fetchone()
        if not category:
            raise ValueError(f"Unknown category '{category_name}'")

        cur.execute(
            """
            SELECT w.id, w.price_min,
                   (6371 * acos(least(1, greatest(-1,
                        cos(radians(%(lat)s)) * cos(radians(w.lat)) * cos(radians(w.lng) - radians(%(lng)s))
                        + sin(radians(%(lat)s)) * sin(radians(w.lat))
                   )))) AS distance_km
            FROM workers w
            JOIN worker_categories wc ON wc.worker_id = w.id
            WHERE wc.category_id = %(category_id)s
              AND w.verification_status = 'verified'
              AND w.is_online = true
              AND w.lat IS NOT NULL AND w.lng IS NOT NULL
            ORDER BY distance_km ASC
            LIMIT 1
            """,
            {"lat": lat, "lng": lng, "category_id": category["id"]},
        )
        nearest = cur.fetchone()
        if not nearest:
            raise ValueError("No available workers nearby for this service right now")

        cur.execute(
            """
            INSERT INTO bookings (
                customer_id, worker_id, category_id, address_id,
                is_emergency, price_estimate, status
            )
            VALUES (%s, %s, %s, %s, true, %s, 'requested')
            RETURNING *
            """,
            (customer_id, nearest["id"], category["id"], address_id, nearest["price_min"]),
        )
        booking = dict(cur.fetchone())
        booking["distance_km"] = nearest["distance_km"]
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
                   u.phone AS worker_phone, c.name AS cooperative_name,
                   cat.name AS category, a.line1 AS address_line1, a.city AS address_city
            FROM bookings b
            JOIN workers w ON w.id = b.worker_id
            JOIN users u ON u.id = w.user_id
            LEFT JOIN cooperatives c ON c.id = w.cooperative_id
            JOIN categories cat ON cat.id = b.category_id
            LEFT JOIN addresses a ON a.id = b.address_id
            WHERE b.id = %s AND b.customer_id = %s
            """,
            (booking_id, customer_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def list_worker_bookings(user_id: str, group: str | None) -> list[dict]:
    statuses = WORKER_GROUP_STATUSES.get(group) if group else None
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return []
        cur.execute(
            """
            SELECT b.id, b.status, b.scheduled_date, b.scheduled_time, b.is_emergency,
                   b.price_estimate, b.notes, b.created_at,
                   u.name AS customer_name, u.photo_url AS customer_photo_url,
                   cat.name AS category,
                   CASE WHEN b.status = 'requested' THEN NULL ELSE a.line1 END AS address_line1,
                   a.city AS address_city
            FROM bookings b
            JOIN users u ON u.id = b.customer_id
            JOIN categories cat ON cat.id = b.category_id
            LEFT JOIN addresses a ON a.id = b.address_id
            WHERE b.worker_id = %(worker_id)s
              AND (%(statuses)s IS NULL OR b.status = ANY(%(statuses)s))
            ORDER BY b.created_at DESC
            """,
            {"worker_id": worker_id, "statuses": statuses},
        )
        return [dict(row) for row in cur.fetchall()]


def accept_booking(booking_id: str, user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute(
            """
            UPDATE bookings
            SET status = 'accepted', updated_at = now()
            WHERE id = %s AND worker_id = %s AND status = 'requested'
            RETURNING *
            """,
            (booking_id, worker_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def decline_booking(booking_id: str, user_id: str, reason: str | None) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute(
            """
            UPDATE bookings
            SET status = 'cancelled', cancelled_reason = %s, updated_at = now()
            WHERE id = %s AND worker_id = %s AND status = 'requested'
            RETURNING *
            """,
            (reason or 'Declined by worker', booking_id, worker_id),
        )
        row = cur.fetchone()
        if not row:
            return None
        booking = dict(row)

        if booking["scheduled_date"] and booking["scheduled_time"]:
            cur.execute(
                """
                UPDATE worker_availability_slots
                SET is_booked = false
                WHERE worker_id = %s AND slot_date = %s AND start_time = %s
                """,
                (worker_id, booking["scheduled_date"], booking["scheduled_time"]),
            )
        return booking


def get_worker_booking(booking_id: str, user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute(
            """
            SELECT b.*, u.name AS customer_name, u.photo_url AS customer_photo_url, u.phone AS customer_phone,
                   cat.name AS category, a.line1 AS address_line1, a.city AS address_city,
                   a.lat AS address_lat, a.lng AS address_lng
            FROM bookings b
            JOIN users u ON u.id = b.customer_id
            JOIN categories cat ON cat.id = b.category_id
            LEFT JOIN addresses a ON a.id = b.address_id
            WHERE b.id = %s AND b.worker_id = %s
            """,
            (booking_id, worker_id),
        )
        row = cur.fetchone()
        if not row:
            return None
        booking = dict(row)
        if booking["status"] == "requested":
            booking["address_line1"] = None
            booking["customer_phone"] = None
        return booking


def list_messages(booking_id: str, user_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT m.id, m.sender_id, m.message, m.created_at
            FROM chat_messages m
            JOIN bookings b ON b.id = m.booking_id
            JOIN workers w ON w.id = b.worker_id
            WHERE m.booking_id = %s AND (b.customer_id = %s OR w.user_id = %s)
            ORDER BY m.created_at ASC
            """,
            (booking_id, user_id, user_id),
        )
        return [dict(row) for row in cur.fetchall()]


def send_message(booking_id: str, sender_id: str, message: str) -> dict:
    with get_db() as (cur, conn):
        cur.execute(
            """
            INSERT INTO chat_messages (booking_id, sender_id, message)
            VALUES (%s, %s, %s)
            RETURNING id, sender_id, message, created_at
            """,
            (booking_id, sender_id, message),
        )
        return dict(cur.fetchone())
