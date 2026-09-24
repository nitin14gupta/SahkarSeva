from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from deps import get_current_user_id
from utils.r2_client import r2_client

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_FOLDERS = {"profile-photos", "worker-documents", "booking-photos", "chat-images"}


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("profile-photos"),
    user_id: str = Depends(get_current_user_id),
):
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail=f"folder must be one of {sorted(ALLOWED_FOLDERS)}")

    contents = await file.read()
    result = r2_client.upload_file(BytesIO(contents), file.filename or "upload", folder=folder)
    return {"url": result["url"]}
