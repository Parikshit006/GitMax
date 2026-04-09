from backend.agents.base import BaseAgent
from backend.models.schemas import PipelineContext

# Risk thresholds
COMPLEXITY_HIGH_THRESHOLD = 15
COMPLEXITY_MEDIUM_THRESHOLD = 8
COMMITS_HIGH_THRESHOLD = 30
COMMITS_MEDIUM_THRESHOLD = 15


def _get_signal_value(signals: list, signal_name: str) -> float:
    """Extract a numeric signal value by name, defaulting to 0."""
    for s in signals:
        if s.name == signal_name:
            try:
                return float(s.value)
            except (TypeError, ValueError):
                return 0.0
    return 0.0


def _map_risk(score: float) -> str:
    """Map normalized 0–1 score to a risk level label."""
    if score >= 0.65:
        return "HIGH"
    elif score >= 0.35:
        return "MEDIUM"
    return "LOW"


class RiskAgent(BaseAgent):
    """
    Calculates a risk score for each file using complexity and commit frequency,
    then maps it to LOW / MEDIUM / HIGH with reasons and a recommendation.
    """

    @property
    def name(self) -> str:
        return "Risk"

    async def run(self, context: PipelineContext) -> PipelineContext:
        context.log(self.name, "running")

        for file_result in context.file_results:
            complexity = _get_signal_value(file_result.signals, "Complexity")
            commits = _get_signal_value(file_result.signals, "Commit Frequency")

            # Normalize each metric to 0–1 and combine with equal weight
            complexity_score = min(complexity / 20.0, 1.0)
            commit_score = min(commits / 50.0, 1.0)
            risk_score = (complexity_score * 0.5) + (commit_score * 0.5)

            risk_level = _map_risk(risk_score)

            # Build human-readable reasons
            reasons: list[str] = []
            if complexity >= COMPLEXITY_HIGH_THRESHOLD:
                reasons.append("High complexity")
            elif complexity >= COMPLEXITY_MEDIUM_THRESHOLD:
                reasons.append("Moderate complexity")

            if commits >= COMMITS_HIGH_THRESHOLD:
                reasons.append("High churn")
            elif commits >= COMMITS_MEDIUM_THRESHOLD:
                reasons.append("Moderate churn")

            # Generate recommendation
            if risk_level == "HIGH":
                recommendation = "Refactor module and add test coverage before merging."
            elif risk_level == "MEDIUM":
                recommendation = "Review carefully and consider adding tests."
            else:
                recommendation = "Looks good — standard review sufficient."

            file_result.risk_level = risk_level
            file_result.reasons = reasons
            file_result.recommendation = recommendation

        context.log(self.name, "done")
        return context
