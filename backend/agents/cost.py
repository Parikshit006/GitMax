from backend.agents.base import BaseAgent
from backend.models.schemas import PipelineContext

# ---------------------------------------------------------------------------
# Cost constants (all values in USD)
# ---------------------------------------------------------------------------
DOWNTIME_COST: float = 50_000   # Cost of production downtime per incident
FIX_COST: float = 30_000        # Engineer time to diagnose and fix
DELAY_COST: float = 20_000      # Delay to downstream teams / releases

TOTAL_IMPACT: float = DOWNTIME_COST + FIX_COST + DELAY_COST  # = 100_000

# Probability of failure by risk level
P_FAILURE: dict[str, float] = {
    "HIGH": 0.65,
    "MEDIUM": 0.35,
    "LOW": 0.10,
    "UNKNOWN": 0.0,
}


class CostAgent(BaseAgent):
    """
    Calculates expected cost per file using the formula:
        Expected Cost = P(failure) × (Downtime + Fix + Delay)
    """

    @property
    def name(self) -> str:
        return "Cost"

    async def run(self, context: PipelineContext) -> PipelineContext:
        context.log(self.name, "running")

        for file_result in context.file_results:
            p_failure = P_FAILURE.get(file_result.risk_level, 0.0)
            file_result.expected_cost = round(p_failure * TOTAL_IMPACT, 2)

        context.log(self.name, "done")
        return context
