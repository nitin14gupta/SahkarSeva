from db.config import get_db


def list_categories() -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute("SELECT id, name, icon FROM categories ORDER BY sort_order")
        return [dict(row) for row in cur.fetchall()]


def list_cooperatives() -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute("SELECT id, name, description, logo_url, verified_since FROM cooperatives ORDER BY name")
        return [dict(row) for row in cur.fetchall()]


def list_workers(
    q: str | None = None,
    category: str | None = None,
    min_rating: float | None = None,
    available_today: bool = False,
    max_price: float | None = None,
    radius_km: float | None = None,
    lat: float | None = None,
    lng: float | None = None,
) -> list[dict]:
    with get_db() as (cur, conn):
        distance_select = ""
        order_by = "rating_avg DESC"
        params: dict = {
            "category": category,
            "q": q,
            "q_like": f"%{q}%" if q else None,
            "min_rating": min_rating,
            "available_today": available_today,
            "max_price": max_price,
            "radius_km": radius_km,
        }

        if lat is not None and lng is not None:
            distance_select = ", (6371 * acos(least(1, greatest(-1, cos(radians(%(lat)s)) * cos(radians(w.lat)) * cos(radians(w.lng) - radians(%(lng)s)) + sin(radians(%(lat)s)) * sin(radians(w.lat)))))) AS distance_km"
            order_by = "distance_km ASC"
            params["lat"] = lat
            params["lng"] = lng
        else:
            distance_select = ", NULL::double precision AS distance_km"

        cur.execute(
            f"""
            WITH base AS (
                SELECT w.id, u.name, u.photo_url, w.bio, w.years_experience,
                       w.price_min, w.price_max, w.rating_avg, w.rating_count,
                       w.is_online, w.lat, w.lng, c.name AS cooperative_name,
                       array_agg(DISTINCT cat.name) AS categories
                       {distance_select}
                FROM workers w
                JOIN users u ON u.id = w.user_id
                LEFT JOIN cooperatives c ON c.id = w.cooperative_id
                JOIN worker_categories wc ON wc.worker_id = w.id
                JOIN categories cat ON cat.id = wc.category_id
                WHERE w.verification_status = 'verified'
                  AND (%(category)s IS NULL OR EXISTS (
                        SELECT 1 FROM worker_categories wc2
                        JOIN categories cat2 ON cat2.id = wc2.category_id
                        WHERE wc2.worker_id = w.id AND cat2.name = %(category)s
                      ))
                  AND (%(q)s IS NULL OR u.name ILIKE %(q_like)s OR w.bio ILIKE %(q_like)s)
                  AND (%(min_rating)s IS NULL OR w.rating_avg >= %(min_rating)s)
                  AND (%(available_today)s = false OR EXISTS (
                        SELECT 1 FROM worker_availability_slots s
                        WHERE s.worker_id = w.id AND s.slot_date = CURRENT_DATE AND s.is_booked = false
                      ))
                GROUP BY w.id, u.name, u.photo_url, c.name
            )
            SELECT * FROM base
            WHERE (%(max_price)s IS NULL OR price_min <= %(max_price)s)
              AND (%(radius_km)s IS NULL OR distance_km <= %(radius_km)s)
            ORDER BY {order_by}
            """,
            params,
        )
        return [dict(row) for row in cur.fetchall()]


def get_worker_detail(worker_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT w.id, u.name, u.photo_url, w.bio, w.years_experience,
                   w.price_min, w.price_max, w.rating_avg, w.rating_count,
                   w.is_online, w.lat, w.lng, c.name AS cooperative_name,
                   array_agg(DISTINCT cat.name) AS categories
            FROM workers w
            JOIN users u ON u.id = w.user_id
            LEFT JOIN cooperatives c ON c.id = w.cooperative_id
            JOIN worker_categories wc ON wc.worker_id = w.id
            JOIN categories cat ON cat.id = wc.category_id
            WHERE w.id = %s
            GROUP BY w.id, u.name, u.photo_url, c.name
            """,
            (worker_id,),
        )
        worker = cur.fetchone()
        if not worker:
            return None
        worker = dict(worker)

        cur.execute(
            """
            SELECT r.rating, r.comment, r.tags, r.created_at, u.name AS customer_name
            FROM reviews r
            JOIN users u ON u.id = r.customer_id
            WHERE r.worker_id = %s
            ORDER BY r.created_at DESC
            LIMIT 20
            """,
            (worker_id,),
        )
        worker["reviews"] = [dict(row) for row in cur.fetchall()]

        cur.execute(
            """
            SELECT id, slot_date, start_time, end_time
            FROM worker_availability_slots
            WHERE worker_id = %s AND is_booked = false AND slot_date >= CURRENT_DATE
            ORDER BY slot_date, start_time
            """,
            (worker_id,),
        )
        worker["availability"] = [dict(row) for row in cur.fetchall()]

        return worker
