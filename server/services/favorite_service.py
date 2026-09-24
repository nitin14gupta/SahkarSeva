from db.config import get_db


def list_favorites(customer_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT w.id, u.name, u.photo_url, w.bio, w.years_experience,
                   w.price_min, w.price_max, w.rating_avg, w.rating_count,
                   w.is_online, w.lat, w.lng, c.name AS cooperative_name,
                   array_agg(DISTINCT cat.name) AS categories
            FROM favorites f
            JOIN workers w ON w.id = f.worker_id
            JOIN users u ON u.id = w.user_id
            LEFT JOIN cooperatives c ON c.id = w.cooperative_id
            JOIN worker_categories wc ON wc.worker_id = w.id
            JOIN categories cat ON cat.id = wc.category_id
            WHERE f.customer_id = %s
            GROUP BY w.id, u.name, u.photo_url, c.name, f.created_at
            ORDER BY f.created_at DESC
            """,
            (customer_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def add_favorite(customer_id: str, worker_id: str) -> None:
    with get_db() as (cur, conn):
        cur.execute(
            "INSERT INTO favorites (customer_id, worker_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (customer_id, worker_id),
        )


def remove_favorite(customer_id: str, worker_id: str) -> None:
    with get_db() as (cur, conn):
        cur.execute(
            "DELETE FROM favorites WHERE customer_id = %s AND worker_id = %s",
            (customer_id, worker_id),
        )


def is_favorite(customer_id: str, worker_id: str) -> bool:
    with get_db() as (cur, conn):
        cur.execute(
            "SELECT 1 FROM favorites WHERE customer_id = %s AND worker_id = %s",
            (customer_id, worker_id),
        )
        return cur.fetchone() is not None
