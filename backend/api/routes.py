from fastapi import APIRouter, HTTPException, Depends
from backend.models.schemas import PRRequest, AnalysisResponse
from backend.services.orchestrator import Orchestrator
from backend.auth.dependencies import get_current_user
from typing import Dict, Any

router = APIRouter()
orchestrator = Orchestrator()


@router.get("/health")
async def health_check() -> dict:
    return {"status": "healthy"}


@router.post("/analyze-pr", response_model=AnalysisResponse)
async def analyze_pr(
    request: PRRequest, 
    user_data: Dict[str, Any] = Depends(get_current_user)
) -> AnalysisResponse:
    """
    Accepts a pull-request payload, triggers the Orchestrator with the user's
    dynamic session payload, and returns a full analysis response.
    """
    try:
        response = await orchestrator.run_pipeline(request, user_data=user_data)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
