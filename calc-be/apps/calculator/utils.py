from dotenv import load_dotenv
import os
import base64
import io
from PIL import Image
from google import genai

load_dotenv(".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_image(image: Image.Image):
    try:
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_bytes = buffered.getvalue()

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"text": "Solve the math problem in this image. Return steps and final answer."},
                        {
                            "inline_data": {
                                "mime_type": "image/png",
                                "data": image_bytes
                            }
                        }
                    ]
                }
            ]
        )

        return response.text

    except Exception as e:
        print("❌ Gemini Error:", e)
        return None
