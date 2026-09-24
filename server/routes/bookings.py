from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import get_current_user_id
from services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


class CreateBookingRequest(BaseModel):
    worker_id: str
    category: str
    address_id: str | None = None
    scheduled_date: str | None = None
    scheduled_time: str | None = None
    notes: str | None = None
    photo_url: str | None = None
    is_emergency: bool = False


class CancelBookingRequest(BaseModel):
    reason: str | None = None


@router.get("")
def get_bookings(status: str | None = None, user_id: str = Depends(get_current_user_id)):
    return {"bookings": booking_service.list_bookings(user_id, status=status)}


@router.post("")
def create_booking(body: CreateBookingRequest, user_id: str = Depends(get_current_user_id)):
    try:
        booking = booking_service.create_booking(
            user_id, body.worker_id, body.category, body.address_id,
            body.scheduled_date, body.scheduled_time, body.notes,
            body.photo_url, body.is_emergency,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
