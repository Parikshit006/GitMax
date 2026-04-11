from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router
from backend.auth.routes import router as auth_router
from contextlib import asynccontextmanager
from backend.database import engine, Base
from backend.config import settings

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

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router)

@app.get("/")
async def root() -> dict:
    return {"message": f"Welcome to {settings.APP_NAME}"}
