from fastapi import APIRouter, Depends
from pydantic import BaseModel

from deps import get_current_user_id
from services import support_service

router = APIRouter(prefix="/support-tickets", tags=["support"])


class CreateTicketRequest(BaseModel):
    subject: str
    message: str
    booking_id: str | None = None


@router.get("")
def get_tickets(user_id: str = Depends(get_current_user_id)):
    return {"tickets": support_service.list_tickets(user_id)}


@router.post("")
def create_ticket(body: CreateTicketRequest, user_id: str = Depends(get_current_user_id)):
    ticket = support_service.create_ticket(user_id, body.booking_id, body.subject, body.message)
    return {"ticket": ticket}
