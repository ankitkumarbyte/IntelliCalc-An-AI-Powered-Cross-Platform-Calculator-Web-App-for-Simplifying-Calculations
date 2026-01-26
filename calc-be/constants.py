import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "development")
SERVER_URL = os.getenv("SERVER_URL", "127.0.0.1")
PORT = int(os.getenv("PORT", 8900))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
