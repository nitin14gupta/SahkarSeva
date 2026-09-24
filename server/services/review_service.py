from db.config import get_db


def create_review(
    booking_id: str, customer_id: str, rating: int, comment: str | None, tags: list[str] | None
) -> dict:
    with get_db() as (cur, conn):
        cur.execute(
            "SELECT worker_id FROM bookings WHERE id = %s AND customer_id = %s",
            (booking_id, customer_id),
        )
        booking = cur.fetchone()
        if not booking:
            raise ValueError("Booking not found")
        worker_id = booking["worker_id"]

        cur.execute(
            """
            INSERT INTO reviews (booking_id, customer_id, worker_id, rating, comment, tags)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (booking_id) DO UPDATE
                SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, tags = EXCLUDED.tags
            RETURNING *
            """,
            (booking_id, customer_id, worker_id, rating, comment, tags),
        )
        review = dict(cur.fetchone())

        cur.execute(
            """
            UPDATE workers w
            SET rating_avg = sub.avg_rating, rating_count = sub.cnt
            FROM (
                SELECT AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS cnt
                FROM reviews WHERE worker_id = %s
            ) sub
            WHERE w.id = %s
            """,
            (worker_id, worker_id),
        )

        return review
