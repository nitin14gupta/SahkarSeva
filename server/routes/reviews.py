from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from deps import get_current_user_id
from services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


class CreateReviewRequest(BaseModel):
    booking_id: str
    rating: int
    comment: str | None = None
    tags: list[str] | None = None


@router.post("")
def create_review(body: CreateReviewRequest, user_id: str = Depends(get_current_user_id)):
    if not (1 <= body.rating <= 5):
        raise HTTPException(status_code=400, detail="rating must be between 1 and 5")
    try:
        review = review_service.create_review(body.booking_id, user_id, body.rating, body.comment, body.tags)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"review": review}
