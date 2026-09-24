from fastapi import APIRouter, Depends, HTTPException, Query

from deps import get_current_user_id
from services import earnings_service

router = APIRouter(prefix="/earnings", tags=["earnings"])


@router.get("/summary")
def get_summary(
    range_: str = Query("daily", alias="range"),
    user_id: str = Depends(get_current_user_id),
):
    if range_ not in ("daily", "weekly", "monthly"):
        raise HTTPException(status_code=400, detail="range must be 'daily', 'weekly', or 'monthly'")
    summary = earnings_service.get_summary(user_id, range_)
    if summary is None:
        raise HTTPException(status_code=404, detail="Worker profile not found")
    return {"summary": summary}
