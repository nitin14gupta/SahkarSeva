import psycopg2.errors

from db.config import get_db


def list_addresses(user_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            "SELECT * FROM addresses WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
            (user_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def create_address(
    user_id: str,
    label: str,
    line1: str,
    city: str | None,
    state: str | None,
    pincode: str | None,
    lat: float | None,
    lng: float | None,
    is_default: bool,
) -> dict:
    with get_db() as (cur, conn):
        if is_default:
            cur.execute("UPDATE addresses SET is_default = false WHERE user_id = %s", (user_id,))

        cur.execute(
            """
            INSERT INTO addresses (user_id, label, line1, city, state, pincode, lat, lng, is_default)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, label, line1, city, state, pincode, lat, lng, is_default),
        )
        return dict(cur.fetchone())


def update_address(
    address_id: str,
    user_id: str,
    label: str,
    line1: str,
    city: str | None,
    state: str | None,
    pincode: str | None,
    lat: float | None,
    lng: float | None,
    is_default: bool,
) -> dict | None:
    with get_db() as (cur, conn):
        if is_default:
            cur.execute("UPDATE addresses SET is_default = false WHERE user_id = %s", (user_id,))

        cur.execute(
            """
            UPDATE addresses
            SET label = %s, line1 = %s, city = %s, state = %s, pincode = %s,
                lat = %s, lng = %s, is_default = %s
            WHERE id = %s AND user_id = %s
            RETURNING *
            """,
            (label, line1, city, state, pincode, lat, lng, is_default, address_id, user_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def delete_address(address_id: str, user_id: str) -> bool:
    with get_db() as (cur, conn):
        try:
            cur.execute(
                "DELETE FROM addresses WHERE id = %s AND user_id = %s RETURNING id",
                (address_id, user_id),
            )
        except psycopg2.errors.ForeignKeyViolation:
            raise ValueError("This address is used in a booking and can't be deleted")
        return cur.fetchone() is not None
