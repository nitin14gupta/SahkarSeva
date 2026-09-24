from fastapi import APIRouter, HTTPException

from services import catalog_service

router = APIRouter(tags=["catalog"])


@router.get("/categories")
def get_categories():
    return {"categories": catalog_service.list_categories()}


@router.get("/cooperatives")
def get_cooperatives():
    return {"cooperatives": catalog_service.list_cooperatives()}


@router.get("/workers")
def get_workers(
    q: str | None = None,
    category: str | None = None,
    min_rating: float | None = None,
    available_today: bool = False,
    max_price: float | None = None,
    radius_km: float | None = None,
    lat: float | None = None,
    lng: float | None = None,
):
    workers = catalog_service.list_workers(
        q=q,
        category=category,
        min_rating=min_rating,
        available_today=available_today,
        max_price=max_price,
        radius_km=radius_km,
        lat=lat,
        lng=lng,
    )
    return {"workers": workers}


@router.get("/workers/{worker_id}")
def get_worker(worker_id: str):
    worker = catalog_service.get_worker_detail(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"worker": worker}
