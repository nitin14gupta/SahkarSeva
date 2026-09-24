from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import get_current_user_id
from services import welfare_service

router = APIRouter(prefix="/welfare", tags=["welfare"])


class EnrollRequest(BaseModel):
    eshram_uan: str | None = None
    scheme_name: str | None = None


class CreateClaimRequest(BaseModel):
    reason: str
    amount_claimed: float | None = None


@router.get("/me")
def get_enrollment(user_id: str = Depends(get_current_user_id)):
    return {"enrollment": welfare_service.get_enrollment(user_id)}


@router.post("/enroll")
def enroll(body: EnrollRequest, user_id: str = Depends(get_current_user_id)):
    try:
        enrollment = welfare_service.enroll(user_id, body.eshram_uan, body.scheme_name)
    except ValueError as e:
        if str(e) == "ALREADY_ENROLLED":
            raise HTTPException(status_code=409, detail="Already enrolled")
        raise HTTPException(status_code=404, detail=str(e))
    return {"enrollment": enrollment}


@router.get("/claims")
def get_claims(user_id: str = Depends(get_current_user_id)):
    return {"claims": welfare_service.list_claims(user_id)}


@router.post("/claims")
def post_claim(body: CreateClaimRequest, user_id: str = Depends(get_current_user_id)):
    try:
        claim = welfare_service.create_claim(user_id, body.reason, body.amount_claimed)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"claim": claim}


@router.get("/claims/{claim_id}")
def get_claim(claim_id: str, user_id: str = Depends(get_current_user_id)):
    claim = welfare_service.get_claim(user_id, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"claim": claim}
