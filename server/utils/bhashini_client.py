import os
import httpx
from dotenv import load_dotenv

load_dotenv()

_INFERENCE_KEY = os.getenv("BHASHINI_INFERENCE_KEY")
_COMPUTE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

# AI4Bharat IndicTrans2 — one model covers English plus ~18 Indian languages,
# which is every language this app's Language Selection screen offers, so no
# need to pick a different serviceId per language pair.
_TRANSLATION_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4"


def translate(text: str, source_lang: str, target_lang: str) -> str:
    """Translates text via Bhashini's Pipeline Compute Call. Returns the
    original text unchanged (rather than raising) if translation isn't
    needed or the call fails — translation is a nice-to-have and should
    never break whatever feature is calling it (e.g. chat send/read)."""
    if not text.strip() or source_lang == target_lang or not _INFERENCE_KEY:
        return text

    try:
        response = httpx.post(
            _COMPUTE_URL,
            headers={"Authorization": _INFERENCE_KEY, "Content-Type": "application/json"},
            json={
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {"sourceLanguage": source_lang, "targetLanguage": target_lang},
                            "serviceId": _TRANSLATION_SERVICE_ID,
                        },
                    }
                ],
                "inputData": {"input": [{"source": text}]},
            },
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["pipelineResponse"][0]["output"][0]["target"]
    except Exception:
        return text
