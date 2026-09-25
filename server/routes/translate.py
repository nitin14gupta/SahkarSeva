from fastapi import APIRouter, Depends
from pydantic import BaseModel

from deps import get_current_user_id
from utils.bhashini_client import translate

router = APIRouter(prefix="/translate", tags=["translate"])


class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


@router.post("")
def translate_text(body: TranslateRequest, user_id: str = Depends(get_current_user_id)):
    return {"translated_text": translate(body.text, body.source_lang, body.target_lang)}
