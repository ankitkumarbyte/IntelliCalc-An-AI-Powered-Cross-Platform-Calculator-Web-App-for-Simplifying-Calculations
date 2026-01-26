from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
import io
from PIL import Image

from apps.calculator.utils import analyze_image

# ✅ THIS PREFIX IS REQUIRED
router = APIRouter(prefix="/calculate", tags=["Calculator"])


class ImagePayload(BaseModel):
    image: str
    dict_of_vars: dict


@router.post("/")
async def calculate(payload: ImagePayload):
    try:
        image_data = payload.image.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        answer = analyze_image(image)

        return {
            "data": [
                {
                    "expr": "Detected Expression",
                    "result": answer,
                    "assign": False,
                }
            ]
        }

    except Exception as e:
        print("❌ ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
