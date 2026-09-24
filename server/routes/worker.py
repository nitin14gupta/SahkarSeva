from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import get_current_user_id
from services import worker_service

router = APIRouter(prefix="/worker", tags=["worker"])


class RegisterWorkerDocument(BaseModel):
    doc_type: str
    url: str
    label: str | None = None


class RegisterWorkerRequest(BaseModel):
    id_number: str | None = None
    cooperative_id: str | None = None
    categories: list[str]
    years_experience: int = 0
    price_min: float | None = None
    price_max: float | None = None
    bio: str | None = None
    lat: float | None = None
    lng: float | None = None
    documents: list[RegisterWorkerDocument] = []


class UpdateWorkerRequest(BaseModel):
    bio: str | None = None
    years_experience: int | None = None
    price_min: float | None = None
    price_max: float | None = None
    payout_schedule: str | None = None


class AddDocumentsRequest(BaseModel):
    documents: list[RegisterWorkerDocument]


class SetOnlineRequest(BaseModel):
    is_online: bool
    lat: float | None = None
    lng: float | None = None


class AddAvailabilityRequest(BaseModel):
    slot_date: str
    start_time: str
    end_time: str


class AddPayoutAccountRequest(BaseModel):
    method: str
    account_holder: str | None = None
    account_number: str | None = None
    ifsc: str | None = None
    upi_id: str | None = None
    is_default: bool = False


@router.get("/me")
def get_my_profile(user_id: str = Depends(get_current_user_id)):
    worker = worker_service.get_my_profile(user_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return {"worker": worker}


@router.post("/register")
def register(body: RegisterWorkerRequest, user_id: str = Depends(get_current_user_id)):
    if not body.categories:
        raise HTTPException(status_code=400, detail="At least one category is required")
    try:
        worker = worker_service.register_worker(
            user_id, body.id_number, body.cooperative_id, body.categories,
            body.years_experience, body.price_min, body.price_max, body.bio,
            body.lat, body.lng, [d.model_dump() for d in body.documents],
        )
    except ValueError as e:
        if str(e) == "ALREADY_REGISTERED":
            raise HTTPException(status_code=409, detail="Worker profile already exists")
        raise HTTPException(status_code=400, detail=str(e))
    return {"worker": worker}


@router.patch("/me")
def update_me(body: UpdateWorkerRequest, user_id: str = Depends(get_current_user_id)):
    worker = worker_service.update_profile(
        user_id, body.bio, body.years_experience, body.price_min, body.price_max, body.payout_schedule,
    )
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return {"worker": worker}


@router.post("/me/documents")
def add_documents(body: AddDocumentsRequest, user_id: str = Depends(get_current_user_id)):
    try:
        documents = worker_service.add_documents(user_id, [d.model_dump() for d in body.documents])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"documents": documents}


@router.get("/me/documents")
def get_documents(user_id: str = Depends(get_current_user_id)):
    return {"documents": worker_service.list_documents(user_id)}


@router.get("/me/dashboard")
def get_dashboard(user_id: str = Depends(get_current_user_id)):
    summary = worker_service.get_dashboard_summary(user_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return {"dashboard": summary}


@router.post("/me/online")
def set_online(body: SetOnlineRequest, user_id: str = Depends(get_current_user_id)):
    worker = worker_service.set_online(user_id, body.is_online, body.lat, body.lng)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return {"worker": worker}


@router.get("/me/availability")
def get_availability(
    from_date: str | None = None,
    to_date: str | None = None,
    user_id: str = Depends(get_current_user_id),
):
    return {"slots": worker_service.list_availability(user_id, from_date, to_date)}


@router.post("/me/availability")
def add_availability(body: AddAvailabilityRequest, user_id: str = Depends(get_current_user_id)):
    try:
        slot = worker_service.add_availability_slot(user_id, body.slot_date, body.start_time, body.end_time)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"slot": slot}


@router.delete("/me/availability/{slot_id}")
def delete_availability(slot_id: str, user_id: str = Depends(get_current_user_id)):
    deleted = worker_service.remove_availability_slot(user_id, slot_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Slot not found or already booked")
    return {"deleted": True}


@router.get("/payout-accounts")
def get_payout_accounts(user_id: str = Depends(get_current_user_id)):
    return {"accounts": worker_service.list_payout_accounts(user_id)}


@router.post("/payout-accounts")
def add_payout_account(body: AddPayoutAccountRequest, user_id: str = Depends(get_current_user_id)):
    if body.method not in ("bank", "upi"):
        raise HTTPException(status_code=400, detail="method must be 'bank' or 'upi'")
    try:
        account = worker_service.add_payout_account(
            user_id, body.method, body.account_holder, body.account_number, body.ifsc, body.upi_id, body.is_default
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"account": account}
