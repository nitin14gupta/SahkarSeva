from fastapi import APIRouter, Depends, HTTPException

from deps import get_current_user_id
from services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def get_notifications(user_id: str = Depends(get_current_user_id)):
    return {"notifications": notification_service.list_notifications(user_id)}


@router.get("/unread-count")
def get_unread_count(user_id: str = Depends(get_current_user_id)):
    return {"count": notification_service.get_unread_count(user_id)}


@router.post("/{notification_id}/read")
def mark_read(notification_id: str, user_id: str = Depends(get_current_user_id)):
    if not notification_service.mark_read(user_id, notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"read": True}


@router.post("/read-all")
def mark_all_read(user_id: str = Depends(get_current_user_id)):
    notification_service.mark_all_read(user_id)
    return {"read": True}
