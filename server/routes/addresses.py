from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import get_current_user_id
from services import address_service

router = APIRouter(prefix="/addresses", tags=["addresses"])


class CreateAddressRequest(BaseModel):
    label: str = "Home"
    line1: str
    line2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    lat: float | None = None
    lng: float | None = None
    is_default: bool = False


@router.get("")
def get_addresses(user_id: str = Depends(get_current_user_id)):
    return {"addresses": address_service.list_addresses(user_id)}


@router.post("")
def create_address(body: CreateAddressRequest, user_id: str = Depends(get_current_user_id)):
    address = address_service.create_address(
        user_id, body.label, body.line1, body.line2, body.city, body.state,
        body.pincode, body.lat, body.lng, body.is_default,
    )
    return {"address": address}


@router.put("/{address_id}")
def update_address(address_id: str, body: CreateAddressRequest, user_id: str = Depends(get_current_user_id)):
    address = address_service.update_address(
        address_id, user_id, body.label, body.line1, body.line2, body.city, body.state,
        body.pincode, body.lat, body.lng, body.is_default,
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"address": address}


@router.delete("/{address_id}")
def delete_address(address_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        deleted = address_service.delete_address(address_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    if not deleted:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"deleted": True}
