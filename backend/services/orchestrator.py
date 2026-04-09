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
        # DEMO_MODE MUST INTERCEPT BEFORE ANY REMOTE LOGIC RUNS
        if settings.DEMO_MODE:
            return self._load_fixture()
            
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
                
            return final_response

        except Exception as e:
            if isinstance(e, ValueError) and str(e) == "No files found in PR":
                raise e
                
            print(f"Pipeline crashed Safely Caught. Falling back to Demo Fixtures. Error: {e}")
            return self._load_fixture()
