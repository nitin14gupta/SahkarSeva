from db.config import get_db
from services import notification_service
from services.worker_service import get_worker_id_for_user
from utils.twilio_client import send_otp, verify_otp


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

# Forward-only job execution loop: accepted -> en_route -> in_progress.
# "Mark Started"/"Mark Completed" inside in_progress are UI-only states —
# completion is its own OTP-gated transition (see complete_booking).
VALID_FORWARD_TRANSITIONS = {
    "accepted": "en_route",
    "en_route": "in_progress",
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
    address_id: str,
    scheduled_date: str | None,
    scheduled_time: str | None,
    notes: str,
    photo_urls: list[str],
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
                scheduled_date, scheduled_time, notes, photo_urls,
                is_emergency, price_estimate
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                customer_id, worker_id, category["id"], address_id, scheduled_date,
                scheduled_time, notes, photo_urls, is_emergency, price_estimate,
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

        cur.execute("SELECT user_id FROM workers WHERE id = %s", (worker_id,))
        worker_user_id = cur.fetchone()["user_id"]
        notification_service.create_notification(
            cur, worker_user_id, "New job request",
            f"New {category_name} request — tap to view", "booking", booking["id"],
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

        cur.execute("SELECT user_id FROM workers WHERE id = %s", (nearest["id"],))
        worker_user_id = cur.fetchone()["user_id"]
        notification_service.create_notification(
            cur, worker_user_id, "Emergency job request",
            f"Emergency {category_name} request nearby — respond quickly", "booking", booking["id"],
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
        if not row:
            return None
        booking = dict(row)

        cur.execute("SELECT user_id FROM workers WHERE id = %s", (booking["worker_id"],))
        worker_user_id = cur.fetchone()["user_id"]
        notification_service.create_notification(
            cur, worker_user_id, "Booking cancelled",
            "The customer cancelled a booking with you", "booking", booking_id,
        )

        return booking


def get_booking(booking_id: str, customer_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT b.*, w.id AS worker_id, u.name AS worker_name, u.photo_url AS worker_photo_url,
                   u.phone AS worker_phone, u.language AS worker_language, c.name AS cooperative_name,
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
        if not row:
            return None
        booking = dict(row)

        cur.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        worker_name = cur.fetchone()["name"]
        notification_service.create_notification(
            cur, booking["customer_id"], "Booking accepted",
            f"{worker_name} accepted your booking", "booking", booking["id"],
        )

        return booking


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

        cur.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        worker_name = cur.fetchone()["name"]
        notification_service.create_notification(
            cur, booking["customer_id"], "Booking declined",
            f"{worker_name} declined your booking request", "booking", booking["id"],
        )

        return booking


def update_status(booking_id: str, user_id: str, new_status: str) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute(
            "SELECT status FROM bookings WHERE id = %s AND worker_id = %s",
            (booking_id, worker_id),
        )
        row = cur.fetchone()
        if not row:
            return None
        if VALID_FORWARD_TRANSITIONS.get(row["status"]) != new_status:
            raise ValueError(f"Can't move from '{row['status']}' to '{new_status}'")

        cur.execute(
            "UPDATE bookings SET status = %s, updated_at = now() WHERE id = %s RETURNING *",
            (new_status, booking_id),
        )
        booking = dict(cur.fetchone())

        cur.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        worker_name = cur.fetchone()["name"]
        status_message = {
            "en_route": f"{worker_name} is on the way",
            "in_progress": f"{worker_name} has started the job",
        }.get(new_status, "Your booking was updated")
        notification_service.create_notification(cur, booking["customer_id"], "Job update", status_message, "booking", booking["id"])

        return booking


def attach_photos(booking_id: str, user_id: str, before_photo_url: str | None, after_photo_url: str | None) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute(
            """
            UPDATE bookings
            SET before_photo_url = COALESCE(%s, before_photo_url),
                after_photo_url = COALESCE(%s, after_photo_url),
                updated_at = now()
            WHERE id = %s AND worker_id = %s
            RETURNING *
            """,
            (before_photo_url, after_photo_url, booking_id, worker_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def send_completion_otp(booking_id: str, user_id: str) -> bool:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return False
        cur.execute(
            """
            SELECT u.phone FROM bookings b
            JOIN users u ON u.id = b.customer_id
            WHERE b.id = %s AND b.worker_id = %s AND b.status = 'in_progress'
            """,
            (booking_id, worker_id),
        )
        row = cur.fetchone()
        if not row:
            return False
    return send_otp(row["phone"])


def complete_booking(
    booking_id: str, user_id: str, otp_code: str, final_amount: float, after_photo_url: str | None
) -> dict:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            raise ValueError("Worker profile not found")
        cur.execute(
            """
            SELECT u.phone FROM bookings b
            JOIN users u ON u.id = b.customer_id
            WHERE b.id = %s AND b.worker_id = %s AND b.status = 'in_progress'
            """,
            (booking_id, worker_id),
        )
        row = cur.fetchone()
        if not row:
            raise ValueError("Booking not found or not in progress")

        if not verify_otp(row["phone"], otp_code):
            raise ValueError("Invalid or expired code")

        cur.execute(
            """
            UPDATE bookings
            SET status = 'completed', final_amount = %s, after_photo_url = COALESCE(%s, after_photo_url),
                completion_confirmed_at = now(), updated_at = now()
            WHERE id = %s
            RETURNING *
            """,
            (final_amount, after_photo_url, booking_id),
        )
        booking = dict(cur.fetchone())

        cur.execute(
            "INSERT INTO payments (booking_id, amount, method, status) VALUES (%s, %s, 'upi', 'success')",
            (booking_id, final_amount),
        )

        notification_service.create_notification(
            cur, booking["customer_id"], "Job completed",
            f"Your job is complete — ₹{final_amount} charged", "booking", booking["id"],
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
                   u.language AS customer_language, cat.name AS category, a.line1 AS address_line1,
                   a.city AS address_city, a.lat AS address_lat, a.lng AS address_lng
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
            SELECT m.id, m.sender_id, m.message, m.read_at, m.created_at
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
            RETURNING id, sender_id, message, read_at, created_at
            """,
            (booking_id, sender_id, message),
        )
        return dict(cur.fetchone())
