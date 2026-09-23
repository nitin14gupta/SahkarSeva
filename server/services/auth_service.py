import os
import time
import jwt

from db.config import get_db

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))


def issue_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": int(time.time()) + JWT_ACCESS_TOKEN_EXPIRES}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> str:
    """Returns the user id from a valid token, raises jwt exceptions if invalid/expired."""
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    return payload["sub"]


def get_or_create_user(phone: str) -> dict:
    with get_db() as (cur, conn):
        cur.execute("SELECT * FROM users WHERE phone = %s", (phone,))
        user = cur.fetchone()
        if user:
            return dict(user)

        cur.execute(
            "INSERT INTO users (phone) VALUES (%s) RETURNING *",
            (phone,),
        )
        return dict(cur.fetchone())


def update_profile(user_id: str, name: str, role: str, language: str, photo_url: str | None) -> dict:
    with get_db() as (cur, conn):
        cur.execute(
            """
            UPDATE users
            SET name = %s, role = %s, language = %s, photo_url = COALESCE(%s, photo_url), updated_at = now()
            WHERE id = %s
            RETURNING *
            """,
            (name, role, language, photo_url, user_id),
        )
        return dict(cur.fetchone())


def get_user(user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        return dict(user) if user else None
