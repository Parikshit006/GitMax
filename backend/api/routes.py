from fastapi import APIRouter, HTTPException
from backend.models.schemas import PRRequest, AnalysisResponse
from backend.services.orchestrator import Orchestrator

router = APIRouter()
orchestrator = Orchestrator()


@router.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}


@router.post("/analyze-pr", response_model=AnalysisResponse)
async def analyze_pr(request: PRRequest) -> AnalysisResponse:
    """
    Accepts a pull-request payload, triggers the Orchestrator,
    and returns a full analysis response.
    """
    try:
        response = await orchestrator.run_pipeline(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
