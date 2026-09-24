from fastapi import APIRouter, Depends

from deps import get_current_user_id
from services import favorite_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("")
def get_favorites(user_id: str = Depends(get_current_user_id)):
    return {"favorites": favorite_service.list_favorites(user_id)}


@router.post("/{worker_id}")
def add_favorite(worker_id: str, user_id: str = Depends(get_current_user_id)):
    favorite_service.add_favorite(user_id, worker_id)
    return {"favorited": True}


@router.delete("/{worker_id}")
def remove_favorite(worker_id: str, user_id: str = Depends(get_current_user_id)):
    favorite_service.remove_favorite(user_id, worker_id)
    return {"favorited": False}
