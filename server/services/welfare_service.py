from db.config import get_db
from services.worker_service import get_worker_id_for_user


def get_enrollment(user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute("SELECT * FROM worker_welfare_enrollments WHERE worker_id = %s", (worker_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def enroll(user_id: str, eshram_uan: str | None, scheme_name: str | None) -> dict:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            raise ValueError("Worker profile not found")

        cur.execute("SELECT id FROM worker_welfare_enrollments WHERE worker_id = %s", (worker_id,))
        if cur.fetchone():
            raise ValueError("ALREADY_ENROLLED")

        cur.execute(
            """
            INSERT INTO worker_welfare_enrollments (worker_id, status, eshram_uan, scheme_name)
            VALUES (%s, 'pending', %s, %s)
            RETURNING *
            """,
            (worker_id, eshram_uan, scheme_name),
        )
        return dict(cur.fetchone())


def list_claims(user_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return []
        cur.execute(
            "SELECT * FROM worker_welfare_claims WHERE worker_id = %s ORDER BY submitted_at DESC",
            (worker_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def create_claim(user_id: str, reason: str, amount_claimed: float | None) -> dict:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            raise ValueError("Worker profile not found")

        cur.execute(
            """
            INSERT INTO worker_welfare_claims (worker_id, reason, amount_claimed)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (worker_id, reason, amount_claimed),
        )
        return dict(cur.fetchone())


def get_claim(user_id: str, claim_id: str) -> dict | None:
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None
        cur.execute(
            "SELECT * FROM worker_welfare_claims WHERE id = %s AND worker_id = %s",
            (claim_id, worker_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None
