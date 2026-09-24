from db.config import get_db


def get_worker_id_for_user(cur, user_id: str) -> str | None:
    """Resolves a workers.id from a user_id using an already-open cursor —
    shared by booking_service/earnings_service so the join isn't duplicated."""
    cur.execute("SELECT id FROM workers WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    return row["id"] if row else None


def get_my_profile(user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT w.*, c.name AS cooperative_name
            FROM workers w
            LEFT JOIN cooperatives c ON c.id = w.cooperative_id
            WHERE w.user_id = %s
            """,
            (user_id,),
        )
        worker = cur.fetchone()
        if not worker:
            return None
        worker = dict(worker)

        cur.execute(
            """
            SELECT cat.name
            FROM worker_categories wc
            JOIN categories cat ON cat.id = wc.category_id
            WHERE wc.worker_id = %s
            """,
            (worker["id"],),
        )
        worker["categories"] = [row["name"] for row in cur.fetchall()]
        return worker


def register_worker(
    user_id: str,
    id_number: str | None,
    cooperative_id: str | None,
    category_names: list[str],
    years_experience: int,
    price_min: float | None,
    price_max: float | None,
    bio: str | None,
    lat: float | None,
    lng: float | None,
    documents: list[dict],
) -> dict:
    with get_db() as (cur, conn):
        cur.execute("SELECT id FROM workers WHERE user_id = %s", (user_id,))
        if cur.fetchone():
            raise ValueError("ALREADY_REGISTERED")

        cur.execute(
            """
            INSERT INTO workers (
                user_id, cooperative_id, bio, years_experience,
                price_min, price_max, id_number, lat, lng, verification_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING *
            """,
            (user_id, cooperative_id, bio, years_experience, price_min, price_max, id_number, lat, lng),
        )
        worker = dict(cur.fetchone())

        for name in category_names:
            cur.execute("SELECT id FROM categories WHERE name = %s", (name,))
            category = cur.fetchone()
            if not category:
                raise ValueError(f"Unknown category '{name}'")
            cur.execute(
                "INSERT INTO worker_categories (worker_id, category_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (worker["id"], category["id"]),
            )

        for doc in documents:
            cur.execute(
                "INSERT INTO worker_documents (worker_id, doc_type, url, label) VALUES (%s, %s, %s, %s)",
                (worker["id"], doc["doc_type"], doc["url"], doc.get("label")),
            )

        worker["categories"] = category_names
        return worker


def update_profile(
    user_id: str,
    bio: str | None,
    years_experience: int | None,
    price_min: float | None,
    price_max: float | None,
    payout_schedule: str | None,
) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            UPDATE workers
            SET bio = COALESCE(%s, bio),
                years_experience = COALESCE(%s, years_experience),
                price_min = COALESCE(%s, price_min),
                price_max = COALESCE(%s, price_max),
                payout_schedule = COALESCE(%s, payout_schedule)
            WHERE user_id = %s
            RETURNING *
            """,
            (bio, years_experience, price_min, price_max, payout_schedule, user_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def add_documents(user_id: str, documents: list[dict]) -> list[dict]:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            raise ValueError("Worker profile not found")

        added = []
        for doc in documents:
            cur.execute(
                """
                INSERT INTO worker_documents (worker_id, doc_type, url, label)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (worker_id, doc["doc_type"], doc["url"], doc.get("label")),
            )
            added.append(dict(cur.fetchone()))

        cur.execute(
            "UPDATE workers SET verification_status = 'pending', verification_reason = NULL WHERE id = %s",
            (worker_id,),
        )
        return added


def list_documents(user_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return []
        cur.execute(
            "SELECT * FROM worker_documents WHERE worker_id = %s ORDER BY created_at",
            (worker_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def set_online(user_id: str, is_online: bool, lat: float | None, lng: float | None) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            UPDATE workers
            SET is_online = %s, lat = COALESCE(%s, lat), lng = COALESCE(%s, lng)
            WHERE user_id = %s
            RETURNING *
            """,
            (is_online, lat, lng, user_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def list_availability(user_id: str, from_date: str | None, to_date: str | None) -> list[dict]:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return []
        cur.execute(
            """
            SELECT * FROM worker_availability_slots
            WHERE worker_id = %(worker_id)s
              AND (%(from_date)s IS NULL OR slot_date >= %(from_date)s)
              AND (%(to_date)s IS NULL OR slot_date <= %(to_date)s)
            ORDER BY slot_date, start_time
            """,
            {"worker_id": worker_id, "from_date": from_date, "to_date": to_date},
        )
        return [dict(row) for row in cur.fetchall()]


def add_availability_slot(user_id: str, slot_date: str, start_time: str, end_time: str) -> dict:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            raise ValueError("Worker profile not found")
        cur.execute(
            """
            INSERT INTO worker_availability_slots (worker_id, slot_date, start_time, end_time)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (worker_id, slot_date, start_time, end_time),
        )
        return dict(cur.fetchone())


def remove_availability_slot(user_id: str, slot_id: str) -> bool:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return False
        cur.execute(
            """
            DELETE FROM worker_availability_slots
            WHERE id = %s AND worker_id = %s AND is_booked = false
            RETURNING id
            """,
            (slot_id, worker_id),
        )
        return cur.fetchone() is not None


def get_dashboard_summary(user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None

        cur.execute(
            "SELECT is_online, verification_status, rating_avg, rating_count FROM workers WHERE id = %s",
            (worker_id,),
        )
        summary = dict(cur.fetchone())

        cur.execute(
            """
            SELECT count(*) AS job_count
            FROM bookings
            WHERE worker_id = %s AND scheduled_date = CURRENT_DATE AND status != 'cancelled'
            """,
            (worker_id,),
        )
        summary["today_job_count"] = cur.fetchone()["job_count"]

        cur.execute(
            """
            SELECT COALESCE(SUM(final_amount), 0) AS earnings
            FROM bookings
            WHERE worker_id = %s AND status = 'completed' AND completion_confirmed_at::date = CURRENT_DATE
            """,
            (worker_id,),
        )
        summary["today_earnings"] = cur.fetchone()["earnings"]

        return summary
