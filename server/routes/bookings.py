from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import get_current_user_id
from services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])

NOTES_MIN_LENGTH = 15
NOTES_MAX_LENGTH = 500
PHOTOS_MIN_COUNT = 2
PHOTOS_MAX_COUNT = 12


class CreateBookingRequest(BaseModel):
    worker_id: str
    category: str
    address_id: str
    scheduled_date: str | None = None
    scheduled_time: str | None = None
    notes: str
    photo_urls: list[str] = []
    is_emergency: bool = False


class CreateEmergencyBookingRequest(BaseModel):
    category: str
    lat: float
    lng: float
    address_id: str | None = None


class CancelBookingRequest(BaseModel):
    reason: str | None = None


class DeclineBookingRequest(BaseModel):
    reason: str | None = None


class UpdateStatusRequest(BaseModel):
    status: str


class AttachPhotosRequest(BaseModel):
    before_photo_url: str | None = None
    after_photo_url: str | None = None


class CompleteBookingRequest(BaseModel):
    otp_code: str
    final_amount: float
    after_photo_url: str | None = None


class SendMessageRequest(BaseModel):
    message: str


@router.get("")
def get_bookings(
    status: str | None = None,
    group: str | None = None,
    user_id: str = Depends(get_current_user_id),
):
    return {"bookings": booking_service.list_bookings(user_id, status=status, group=group)}


@router.post("")
def create_booking(body: CreateBookingRequest, user_id: str = Depends(get_current_user_id)):
    notes = body.notes.strip()
    if not (NOTES_MIN_LENGTH <= len(notes) <= NOTES_MAX_LENGTH):
        raise HTTPException(
            status_code=400,
            detail=f"Notes must be between {NOTES_MIN_LENGTH} and {NOTES_MAX_LENGTH} characters",
        )
    if not (PHOTOS_MIN_COUNT <= len(body.photo_urls) <= PHOTOS_MAX_COUNT):
        raise HTTPException(
            status_code=400,
            detail=f"Attach between {PHOTOS_MIN_COUNT} and {PHOTOS_MAX_COUNT} photos",
        )

    try:
        booking = booking_service.create_booking(
            user_id, body.worker_id, body.category, body.address_id,
            body.scheduled_date, body.scheduled_time, notes,
            body.photo_urls, body.is_emergency,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"booking": booking}


@router.post("/emergency")
def create_emergency_booking(body: CreateEmergencyBookingRequest, user_id: str = Depends(get_current_user_id)):
    try:
        booking = booking_service.create_emergency_booking(
            user_id, body.category, body.address_id, body.lat, body.lng
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"booking": booking}


@router.get("/worker")
def get_worker_bookings(group: str | None = None, user_id: str = Depends(get_current_user_id)):
    return {"bookings": booking_service.list_worker_bookings(user_id, group)}


@router.get("/worker/{booking_id}")
def get_worker_booking(booking_id: str, user_id: str = Depends(get_current_user_id)):
    booking = booking_service.get_worker_booking(booking_id, user_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": booking}


@router.get("/{booking_id}")
def get_booking(booking_id: str, user_id: str = Depends(get_current_user_id)):
    booking = booking_service.get_booking(booking_id, user_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": booking}


@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: str, body: CancelBookingRequest, user_id: str = Depends(get_current_user_id)):
    booking = booking_service.cancel_booking(booking_id, user_id, body.reason)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or can't be cancelled")
    return {"booking": booking}


@router.post("/{booking_id}/accept")
def accept_booking(booking_id: str, user_id: str = Depends(get_current_user_id)):
    booking = booking_service.accept_booking(booking_id, user_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or can't be accepted")
    return {"booking": booking}


@router.post("/{booking_id}/decline")
def decline_booking(booking_id: str, body: DeclineBookingRequest, user_id: str = Depends(get_current_user_id)):
    booking = booking_service.decline_booking(booking_id, user_id, body.reason)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or can't be declined")
    return {"booking": booking}


@router.post("/{booking_id}/status")
def update_status(booking_id: str, body: UpdateStatusRequest, user_id: str = Depends(get_current_user_id)):
    if body.status not in ("en_route", "in_progress"):
        raise HTTPException(status_code=400, detail="status must be 'en_route' or 'in_progress'")
    try:
        booking = booking_service.update_status(booking_id, user_id, body.status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": booking}


@router.post("/{booking_id}/photos")
def attach_photos(booking_id: str, body: AttachPhotosRequest, user_id: str = Depends(get_current_user_id)):
    booking = booking_service.attach_photos(booking_id, user_id, body.before_photo_url, body.after_photo_url)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"booking": booking}


@router.post("/{booking_id}/complete/send-otp")
def send_completion_otp(booking_id: str, user_id: str = Depends(get_current_user_id)):
    sent = booking_service.send_completion_otp(booking_id, user_id)
    if not sent:
        raise HTTPException(status_code=404, detail="Booking not found or not in progress")
    return {"sent": True}


@router.post("/{booking_id}/complete")
def complete_booking(booking_id: str, body: CompleteBookingRequest, user_id: str = Depends(get_current_user_id)):
    try:
        booking = booking_service.complete_booking(
            booking_id, user_id, body.otp_code, body.final_amount, body.after_photo_url
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"booking": booking}


@router.get("/{booking_id}/messages")
def get_messages(booking_id: str, user_id: str = Depends(get_current_user_id)):
    return {"messages": booking_service.list_messages(booking_id, user_id)}


@router.post("/{booking_id}/messages")
def post_message(booking_id: str, body: SendMessageRequest, user_id: str = Depends(get_current_user_id)):
    message = booking_service.send_message(booking_id, user_id, body.message)
    return {"message": message}
