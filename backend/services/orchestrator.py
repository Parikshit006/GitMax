import uuid
import os
import json

from backend.config import settings

from backend.agents import (
    CodeMinerAgent,
    AnalyzerAgent,
    RiskAgent,
    CostAgent,
    ReportAgent,
)
from backend.models.schemas import AnalysisResponse, PipelineContext, PRRequest


class Orchestrator:
    """
    Service responsible for coordinating the sequential specialized agent pipeline in the PR analysis workflow.
    """

    def __init__(self):
        # Initialize the sequential chain of agents
        self.agents = [
            CodeMinerAgent(),
            AnalyzerAgent(),
            RiskAgent(),
            CostAgent(),
            ReportAgent(),
        ]

    def _load_fixture(self) -> AnalysisResponse:
        """Loads the fail-safe hackathon presentation mock payload avoiding remote APIs."""
        fixture_path = os.path.join(os.path.dirname(__file__), "..", "demo_fixtures", "fastapi_pr1.json")
        with open(fixture_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return AnalysisResponse(**data)

    async def run_pipeline(self, request: PRRequest, user_data: dict = None) -> AnalysisResponse:
        """
        Runs the full PR analysis pipeline for a given request.
        Safely intercepts via DEMO_MODE toggle guaranteeing presentation performance.
        """
        # LOG TO ENSURE TRANSPARENCY
        print(f"[ORCHESTRATOR] Running REAL pipeline for {request.repo_url} (PR #{request.pr_number})")

            
        # Create the initial shared context
        run_id = str(uuid.uuid4())
        context = PipelineContext(
            run_id=run_id,
            pr_request=request,
            config={},
            auth_provider=user_data.get("provider") if user_data else None,
            auth_token=user_data.get("access_token") if user_data else None,
        )

        # Execute each agent sequentially
        try:
            for agent in self.agents:
                context = await agent.run(context)
                
            # Retrieve the final response assembled by the ReportAgent
            final_response = context.config.get("final_response")
            
            if not final_response:
                raise ValueError("ReportAgent did not produce a final response.")
                
            # Safely hook into local database ignoring DEMO constraints natively
            if not settings.DEMO_MODE and user_data:
                try:
                    from backend.database import AsyncSessionLocal
                    from backend.services.db_service import log_analysis_result
                    async with AsyncSessionLocal() as db:
                        await log_analysis_result(
                            db, user_data=user_data, 
                            repo_url=request.repo_url, 
                            pr_number=request.pr_number, 
                            analysis_resp=final_response.model_dump()
                        )
                except Exception as log_e:
                    if str(log_e) == "'id'":
                        print("[ORCHESTRATOR] CRITICAL: user_data is missing 'id'. User MUST Sign Out and Sign In again to refresh their session token.")
                    else:
                        print(f"[ORCHESTRATOR] Non-fatal DB logging failure: {type(log_e).__name__}: {log_e}")

            return final_response

        except Exception as e:
            if isinstance(e, ValueError) and str(e) == "No files found in PR":
                raise e
                
            print(f"Pipeline execution failed: {type(e).__name__}: {e}")
            # Do NOT return a fixture here unless explicitly forced. 
            # Return a structured error response instead.
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

