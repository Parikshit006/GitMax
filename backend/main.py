from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from backend.api.routes import router as api_router
from backend.auth.routes import router as auth_router
from backend.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="GitMax PR Analysis API",
    version="0.1.0",
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router)

@app.get("/")
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME}"}
