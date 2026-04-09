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


from fastapi.responses import JSONResponse

@router.post("/analyze-pr", response_model=AnalysisResponse)
async def analyze_pr(
    request: PRRequest, 
    user_data: Dict[str, Any] = Depends(get_current_user)
):
    url = request.repo_url.lower()
    
    # 1. Provider Validation
    if "github.com" not in url and "gitlab.com" not in url:
        return JSONResponse(status_code=400, content={"error": "Unsupported provider"})
        
    # 2. PR Format Validation limits
    if "/pull/" not in url and "/merge_requests/" not in url:
        return JSONResponse(
            status_code=400, 
            content={
                "error": "Invalid PR URL", 
                "message": "Please provide a valid GitHub or GitLab pull request URL"
            }
        )

    # 3. Explicit Empty-Data execution handler
    try:
        response = await orchestrator.run_pipeline(request, user_data)
        return response
    except ValueError as ve:
        if str(ve) == "No files found in PR":
            return JSONResponse(status_code=400, content={"error": "No files found in PR"})
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
