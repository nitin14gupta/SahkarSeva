import os
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from deps import get_current_user_id
from services import payment_service

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/public-key")
def get_public_key(user_id: str = Depends(get_current_user_id)):
    """The Razorpay key id (never the secret) — safe to ship to the client so
    it can init the on-device SDK for VPA validation (see hooks/useVpaValidation)."""
    return {"key": os.getenv("RAZORPAY_KEY_ID")}


@router.get("/callback")
def payment_callback(request: Request):
    """Razorpay redirects here after a Payment Link checkout (it rejects custom
    URL schemes as callback_url). Forward the same query params on into the
    app's own scheme so expo-web-browser's auth session picks it up."""
    query = urlencode(dict(request.query_params))
    return RedirectResponse(url=f"client://payment-callback?{query}")


class AddPaymentMethodRequest(BaseModel):
    type: str
    upi_id: str | None = None
    is_default: bool = False


class CreatePaymentRequest(BaseModel):
    booking_id: str
    method: str


class VerifyPaymentRequest(BaseModel):
    razorpay_payment_link_id: str
    razorpay_payment_link_reference_id: str
    razorpay_payment_link_status: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.get("")
def get_payments(user_id: str = Depends(get_current_user_id)):
    return {"payments": payment_service.list_payments(user_id)}


@router.get("/methods")
def get_methods(user_id: str = Depends(get_current_user_id)):
    return {"methods": payment_service.list_payment_methods(user_id)}


@router.post("/methods")
def add_method(body: AddPaymentMethodRequest, user_id: str = Depends(get_current_user_id)):
    if body.type not in ("upi", "wallet"):
        raise HTTPException(status_code=400, detail="Invalid payment method type")
    method = payment_service.add_payment_method(user_id, body.type, body.upi_id, body.is_default)
    return {"method": method}


@router.delete("/methods/{method_id}")
def delete_method(method_id: str, user_id: str = Depends(get_current_user_id)):
    if not payment_service.delete_payment_method(method_id, user_id):
        raise HTTPException(status_code=404, detail="Payment method not found")
    return {"deleted": True}


@router.post("/methods/{method_id}/default")
def set_default_method(method_id: str, user_id: str = Depends(get_current_user_id)):
    method = payment_service.set_default_payment_method(method_id, user_id)
    if not method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    return {"method": method}


@router.post("/create")
def create_payment(body: CreatePaymentRequest, user_id: str = Depends(get_current_user_id)):
    try:
        payment = payment_service.create_payment_for_booking(body.booking_id, user_id, body.method)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"payment": payment}


@router.post("/verify")
def verify_payment(body: VerifyPaymentRequest, user_id: str = Depends(get_current_user_id)):
    try:
        payment = payment_service.verify_and_complete_payment(
            body.razorpay_payment_link_id,
            body.razorpay_payment_link_reference_id,
            body.razorpay_payment_link_status,
            body.razorpay_payment_id,
            body.razorpay_signature,
            user_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if payment["status"] != "success":
        raise HTTPException(status_code=400, detail="Payment verification failed")
    return {"payment": payment}


@router.get("/booking/{booking_id}")
def get_payment(booking_id: str, user_id: str = Depends(get_current_user_id)):
    payment = payment_service.get_payment_for_booking(booking_id, user_id)
    if not payment:
        raise HTTPException(status_code=404, detail="No payment found for this booking")
    return {"payment": payment}
