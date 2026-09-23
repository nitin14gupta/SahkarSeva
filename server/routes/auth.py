from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
import jwt

from utils.twilio_client import send_otp, verify_otp
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    code: str


class ProfileRequest(BaseModel):
    name: str
    role: str
    language: str = "en"
    photo_url: str | None = None


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    try:
        return auth_service.decode_token(credentials.credentials)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/otp/send")
def otp_send(body: SendOtpRequest):
    sent = send_otp(body.phone)
    if not sent:
        raise HTTPException(status_code=502, detail="Failed to send OTP")
    return {"sent": True}


@router.post("/otp/verify")
def otp_verify(body: VerifyOtpRequest):
    if not verify_otp(body.phone, body.code):
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    user = auth_service.get_or_create_user(body.phone)
    token = auth_service.issue_token(str(user["id"]))
    return {"token": token, "user": user}


@router.post("/profile")
def complete_profile(body: ProfileRequest, user_id: str = Depends(get_current_user_id)):
    if body.role not in ("customer", "worker"):
        raise HTTPException(status_code=400, detail="role must be 'customer' or 'worker'")

    user = auth_service.update_profile(
        user_id, body.name, body.role, body.language, body.photo_url
    )
    return {"user": user}


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    user = auth_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}
