from db.config import get_db
from utils.razorpay_client import create_payment_link, verify_payment_link_signature


def list_payment_methods(user_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            "SELECT * FROM payment_methods WHERE user_id = %s ORDER BY is_default DESC, created_at DESC",
            (user_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def add_payment_method(user_id: str, type_: str, upi_id: str | None, is_default: bool) -> dict:
    with get_db() as (cur, conn):
        if is_default:
            cur.execute("UPDATE payment_methods SET is_default = false WHERE user_id = %s", (user_id,))
        cur.execute(
            """
            INSERT INTO payment_methods (user_id, type, upi_id, is_default)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, type_, upi_id, is_default),
        )
        return dict(cur.fetchone())


def delete_payment_method(method_id: str, user_id: str) -> bool:
    with get_db() as (cur, conn):
        cur.execute(
            "DELETE FROM payment_methods WHERE id = %s AND user_id = %s RETURNING id",
            (method_id, user_id),
        )
        return cur.fetchone() is not None


def set_default_payment_method(method_id: str, user_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute("UPDATE payment_methods SET is_default = false WHERE user_id = %s", (user_id,))
        cur.execute(
            "UPDATE payment_methods SET is_default = true WHERE id = %s AND user_id = %s RETURNING *",
            (method_id, user_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def create_payment_for_booking(booking_id: str, customer_id: str, method: str) -> dict:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT b.*, u.phone, u.name AS customer_name, cat.name AS category
            FROM bookings b
            JOIN users u ON u.id = b.customer_id
            JOIN categories cat ON cat.id = b.category_id
            WHERE b.id = %s AND b.customer_id = %s
            """,
            (booking_id, customer_id),
        )
        booking = cur.fetchone()
        if not booking:
            raise ValueError("Booking not found")

        amount = float(booking["price_estimate"] or 0)
        link = create_payment_link(
            amount,
            reference_id=booking_id,
            description=f"SahkarSeva — {booking['category']}",
            phone=booking["phone"],
        )

        cur.execute(
            """
            INSERT INTO payments (booking_id, amount, method, razorpay_order_id, status)
            VALUES (%s, %s, %s, %s, 'pending')
            RETURNING *
            """,
            (booking_id, amount, method, link["id"]),
        )
        payment = dict(cur.fetchone())
        payment["checkout_url"] = link["short_url"]
        return payment


def verify_and_complete_payment(
    payment_link_id: str,
    payment_link_reference_id: str,
    payment_link_status: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    customer_id: str,
) -> dict:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT p.* FROM payments p
            JOIN bookings b ON b.id = p.booking_id
            WHERE p.razorpay_order_id = %s AND b.customer_id = %s
            """,
            (payment_link_id, customer_id),
        )
        payment = cur.fetchone()
        if not payment:
            raise ValueError("Payment not found")

        valid = verify_payment_link_signature(
            payment_link_id, payment_link_reference_id, payment_link_status,
            razorpay_payment_id, razorpay_signature,
        )
        status = "success" if valid else "failed"

        cur.execute(
            """
            UPDATE payments
            SET status = %s, razorpay_payment_id = %s
            WHERE id = %s
            RETURNING *
            """,
            (status, razorpay_payment_id, payment["id"]),
        )
        return dict(cur.fetchone())


def list_payments(customer_id: str) -> list[dict]:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT p.*, cat.name AS category, u.name AS worker_name
            FROM payments p
            JOIN bookings b ON b.id = p.booking_id
            JOIN categories cat ON cat.id = b.category_id
            JOIN workers w ON w.id = b.worker_id
            JOIN users u ON u.id = w.user_id
            WHERE b.customer_id = %s
            ORDER BY p.created_at DESC
            """,
            (customer_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def get_payment_for_booking(booking_id: str, customer_id: str) -> dict | None:
    with get_db() as (cur, conn):
        cur.execute(
            """
            SELECT p.* FROM payments p
            JOIN bookings b ON b.id = p.booking_id
            WHERE p.booking_id = %s AND b.customer_id = %s
            ORDER BY p.created_at DESC LIMIT 1
            """,
            (booking_id, customer_id),
        )
        row = cur.fetchone()
        return dict(row) if row else None
