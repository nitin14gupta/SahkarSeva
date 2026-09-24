from db.config import get_db
from services.worker_service import get_worker_id_for_user

RANGE_TRUNC = {
    "daily": "day",
    "weekly": "week",
    "monthly": "month",
}


def get_today_earnings(cur, worker_id: str) -> float:
    cur.execute(
        """
        SELECT COALESCE(SUM(final_amount), 0) AS earnings
        FROM bookings
        WHERE worker_id = %s AND status = 'completed' AND completion_confirmed_at::date = CURRENT_DATE
        """,
        (worker_id,),
    )
    return float(cur.fetchone()["earnings"])


def get_summary(user_id: str, range_key: str) -> dict | None:
    trunc = RANGE_TRUNC.get(range_key, "day")
    with get_db() as (cur, conn):
        worker_id = get_worker_id_for_user(cur, user_id)
        if not worker_id:
            return None

        cur.execute(
            """
            SELECT COALESCE(c.commission_pct, 5.00) AS commission_pct
            FROM workers w
            LEFT JOIN cooperatives c ON c.id = w.cooperative_id
            WHERE w.id = %s
            """,
            (worker_id,),
        )
        commission_pct = float(cur.fetchone()["commission_pct"])

        # trunc is drawn from the RANGE_TRUNC whitelist above, never raw user
        # input — date_trunc()'s first arg can't be a bind parameter anyway.
        cur.execute(
            f"""
            SELECT date_trunc('{trunc}', completion_confirmed_at) AS bucket,
                   COUNT(*) AS jobs, COALESCE(SUM(final_amount), 0) AS gross
            FROM bookings
            WHERE worker_id = %s AND status = 'completed' AND completion_confirmed_at IS NOT NULL
              AND completion_confirmed_at >= now() - interval '90 days'
            GROUP BY bucket
            ORDER BY bucket
            """,
            (worker_id,),
        )

        buckets = []
        total_gross = 0.0
        total_jobs = 0
        for row in cur.fetchall():
            gross = float(row["gross"])
            commission = round(gross * commission_pct / 100, 2)
            buckets.append({
                "period": row["bucket"].date().isoformat(),
                "jobs": row["jobs"],
                "gross": gross,
                "commission": commission,
                "net": round(gross - commission, 2),
            })
            total_gross += gross
            total_jobs += row["jobs"]

        total_commission = round(total_gross * commission_pct / 100, 2)

        return {
            "range": range_key,
            "commission_pct": commission_pct,
            "today_earnings": get_today_earnings(cur, worker_id),
            "total_jobs": total_jobs,
            "total_gross": round(total_gross, 2),
            "total_commission": total_commission,
            "total_net": round(total_gross - total_commission, 2),
            "buckets": buckets,
        }
