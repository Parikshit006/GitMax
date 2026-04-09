import uuid

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
    Service responsible for orchestrating agents in the PR analysis pipeline.
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

    async def run_pipeline(self, request: PRRequest) -> AnalysisResponse:
        """
        Runs the full PR analysis pipeline for a given request.
        """
        # Create the initial shared context
        run_id = str(uuid.uuid4())
        context = PipelineContext(
            run_id=run_id,
            pr_request=request,
            config={},
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
            # Basic error handling; in a real app, you might want to log this 
            # and return a standardized error response.
            print(f"Pipeline failed: {e}")
            raise
