from backend.agents.base import BaseAgent
from backend.models.schemas import PipelineContext

# ---------------------------------------------------------------------------
# Default SLA config — used when company_config is missing or incomplete
# ---------------------------------------------------------------------------
DEFAULT_SLA = {
    "hourly_downtime_cost": 5600,
    "engineer_count": 3,
    "avg_engineer_hourly_rate": 85,
    "avg_fix_days": 5,
    "feature_delay_cost_per_day": 2000,
}

# Probability of failure by risk level
P_FAILURE: dict[str, float] = {
    "HIGH": 0.65,
    "MEDIUM": 0.35,
    "LOW": 0.10,
    "UNKNOWN": 0.0,
}


def _safe_float(value, fallback: float) -> float:
    """Coerce a value to a non-negative float, or return fallback."""
    try:
        v = float(value)
        return v if v >= 0 else fallback
    except (TypeError, ValueError):
        return fallback


class CostAgent(BaseAgent):
    """
    Calculates expected cost per file using company SLA config:
        downtime_cost  = hourly_downtime_cost
        engineer_cost  = engineer_count × avg_engineer_hourly_rate × avg_fix_days × 8
        delay_cost     = feature_delay_cost_per_day × avg_fix_days
        Expected Loss  = P(failure) × (downtime_cost + engineer_cost + delay_cost)
    """

    @property
    def name(self) -> str:
        return "Cost"

    async def run(self, context: PipelineContext) -> PipelineContext:
        context.log(self.name, "running")

        # Resolve company config: request payload → safe defaults
        raw_config = (context.pr_request.company_config or {}) if context.pr_request else {}
        cfg = {
            k: _safe_float(raw_config.get(k), DEFAULT_SLA[k])
            for k in DEFAULT_SLA
        }

        # Compute total impact from SLA parameters
        downtime_cost = cfg["hourly_downtime_cost"]
        engineer_cost = cfg["engineer_count"] * cfg["avg_engineer_hourly_rate"] * cfg["avg_fix_days"] * 8
        delay_cost = cfg["feature_delay_cost_per_day"] * cfg["avg_fix_days"]
        total_impact = downtime_cost + engineer_cost + delay_cost

        for file_result in context.file_results:
            p_failure = P_FAILURE.get(file_result.risk_level, 0.0)
            file_result.expected_cost = round(p_failure * total_impact, 2)

        context.log(self.name, "done")
        return context

