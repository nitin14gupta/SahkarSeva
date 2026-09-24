import os
import razorpay
from dotenv import load_dotenv

load_dotenv()

_key_id = os.getenv("RAZORPAY_KEY_ID")
_key_secret = os.getenv("RAZORPAY_KEY_SECRET")

_client = razorpay.Client(auth=(_key_id, _key_secret))

# Uses Razorpay Payment Links (hosted checkout, opened via expo-web-browser) rather
# than the native Razorpay Checkout SDK — avoids needing a native module + rebuild
# for payments specifically. Razorpay rejects custom URL schemes for callback_url,
# so it points at this backend's own /payments/callback route, which 302-redirects
# into the app's "client://" scheme (see routes/payments.py and app.json's "scheme").
CALLBACK_URL = f"{os.getenv('PUBLIC_BASE_URL')}/payments/callback"


def create_payment_link(amount_rupees: float, reference_id: str, description: str, phone: str) -> dict:
    return _client.payment_link.create({
        "amount": int(round(amount_rupees * 100)),
        "currency": "INR",
        "reference_id": reference_id,
        "description": description,
        "customer": {"contact": phone},
        "callback_url": CALLBACK_URL,
        "callback_method": "get",
    })


def verify_payment_link_signature(
    payment_link_id: str,
    payment_link_reference_id: str,
    payment_link_status: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    try:
        _client.utility.verify_payment_link_signature({
            "payment_link_id": payment_link_id,
            "payment_link_reference_id": payment_link_reference_id,
            "payment_link_status": payment_link_status,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
