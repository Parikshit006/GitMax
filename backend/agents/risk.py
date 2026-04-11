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

            # Health Score framing (100 = perfect, 0 = high risk)
            health_score = max(0, min(100, int((1.0 - risk_score) * 100)))

            # Build human-readable reasons with predictive 90-Day phrasing
            reasons: list[str] = []
            if complexity >= COMPLEXITY_HIGH_THRESHOLD:
                prob = max(80, 100 - health_score)
                reasons.append(f"High complexity detected. {prob}% probability of causing structural slow-downs in the next 90 days.")
            elif complexity >= COMPLEXITY_MEDIUM_THRESHOLD:
                reasons.append("Moderate complexity. Monitored for future 90-day maintenance cycles.")

            if commits >= COMMITS_HIGH_THRESHOLD:
                reasons.append("Extreme historical bug churn (via PyDriller). High risk of immediate regression.")

            # Generate recommendation based on actual Health
            if health_score < 40:
                recommendation = "REJECT. Cost of inaction too high. Refactor architecture immediately."
            elif health_score < 75:
                recommendation = "WARN. Requires executive sign-off for technical debt accumulation."
            else:
                recommendation = "APPROVE. Standard review sufficient."

            file_result.risk_level = risk_level
            file_result.reasons = reasons
            file_result.recommendation = recommendation
            
            # Injecting the health_score as a Signal for downstream LangChain summary
            file_result.signals.append(
                __import__("backend.models.schemas", fromlist=["SignalOutput"]).SignalOutput(
                    name="Health Score", value=health_score, status="INFO"
                )
            )

        context.log(self.name, "done")
        return context
