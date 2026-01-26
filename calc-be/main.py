from fastapi import FastAPI
from apps.calculator.route import router as calculator_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ REQUIRED FOR FRONTEND
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ THIS LINE IS CRITICAL
app.include_router(calculator_router)


@app.get("/")
def root():
    return {"status": "ok"}
