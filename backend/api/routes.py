from typing import Any, Dict, List
import httpx
from fastapi.responses import JSONResponse
from backend.models.schemas import PRRequest, AnalysisResponse, RepoResponse, PRListResponse, HistoryResponse
from backend.services.orchestrator import Orchestrator
from backend.auth.dependencies import get_current_user
from backend.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.models.database import AnalysisLog, User

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

@router.get("/github/repos", response_model=List[RepoResponse])
async def get_github_repos(user_data: Dict[str, Any] = Depends(get_current_user)):
    """Yields all active authenticated GitHub user repositories securely mapped to UI targets."""
    token = user_data.get("access_token")
    if not token or user_data.get("provider") != "github":
        return JSONResponse(status_code=400, content={"error": "Explicit GitHub OAuth Session required"})
        
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
            # Default sorting to push history returning relevant repos instantly
            res = await client.get("https://api.github.com/user/repos?sort=pushed&per_page=100", headers=headers, timeout=10)
            if res.status_code != 200:
                print(f"Automated HTTPX drop: {res.text}")
                return []
            
            repos_data = res.json()
            out = []
            for r in repos_data:
                out.append({
                    "name": r.get("name", ""),
                    "owner": r.get("owner", {}).get("login", ""),
                    "is_private": r.get("private", False)
                })
            return out
    except Exception as e:
        print(f"Graceful trap resolving Github repos limit: {e}")
        return []

@router.get("/github/repos/{owner}/{repo}/prs", response_model=List[PRListResponse])
async def get_github_prs(owner: str, repo: str, user_data: Dict[str, Any] = Depends(get_current_user)):
    """Dynamically parses historical specific repo pull requests safely passing HTML links to UI loops."""
    token = user_data.get("access_token")
    if not token or user_data.get("provider") != "github":
        return JSONResponse(status_code=400, content={"error": "Explicit GitHub OAuth Session required"})
        
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
            res = await client.get(f"https://api.github.com/repos/{owner}/{repo}/pulls?state=all&per_page=30", headers=headers, timeout=10)
            if res.status_code != 200:
                print(f"Automated HTTPX drop: {res.text}")
                return []
                
            prs_data = res.json()
            out = []
            for pr in prs_data:
                out.append({
                    "pr_number": pr.get("number", 0),
                    "title": pr.get("title", ""),
                    "state": pr.get("state", ""),
                    "html_url": pr.get("html_url", "")
                })
            return out
    except Exception as e:
        print(f"Graceful trap resolving Github PR limits: {e}")
        return []

@router.get("/history", response_model=List[HistoryResponse])
async def get_history(user_data: Dict[str, Any] = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Yields recent analytical deployments structurally dynamically to UI dashboards without exposing deep IDs."""
    if not user_data or "id" not in user_data:
        return []
        
    user_q = await db.execute(select(User.id).filter_by(provider=user_data.get('provider', 'github'), provider_user_id=str(user_data['id'])))
    internal_user_id = user_q.scalar_one_or_none()
    
    if not internal_user_id:
        return []

    # Cascade efficient fetching isolating explicitly exactly recent 10 natively
    query = (
        select(AnalysisLog)
        .filter(AnalysisLog.user_id == internal_user_id)
        .order_by(AnalysisLog.created_at.desc())
        .limit(10)
    )
    
    results = await db.execute(query)
    logs = results.scalars().all()
    
    return [
        {
            "id": str(log.id),
            "created_at": log.created_at,
            "top_file": log.top_file,
            "risk_score": log.risk_score,
            "expected_loss": float(log.expected_loss),
            "summary": log.summary_text
        } for log in logs
    ]
