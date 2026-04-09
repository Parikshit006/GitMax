from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from backend.api.routes import router as api_router
from backend.auth.routes import router as auth_router
from contextlib import asynccontextmanager
from backend.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite constraints securely if they don't explicitly exist locally
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="GitMax PR Analysis API",
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router)

@app.get("/")
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME}"}
