from fastapi import FastAPI
from backend.api.routes import router
from backend.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="GitMax PR Analysis API",
    version="0.1.0",
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME}"}
