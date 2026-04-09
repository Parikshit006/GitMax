from backend.agents.base import BaseAgent
from backend.models.schemas import (
    AnalysisResponse,
    PipelineContext,
    SignalOutput,
    Summary,
)

# Confidence by overall risk level
CONFIDENCE_MAP: dict[str, float] = {
    "HIGH": 0.62,
    "MEDIUM": 0.75,
    "LOW": 0.90,
    "UNKNOWN": 0.50,
}

RISK_PRIORITY = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"]


class ReportAgent(BaseAgent):
    """
    Aggregates all file results and produces the final AnalysisResponse.
    Uses a simple template — no LLM required at this stage.
    """

    @property
    def name(self) -> str:
        return "Report"

    async def run(self, context: PipelineContext) -> PipelineContext:
        context.log(self.name, "running")

        # Determine overall risk (worst across all files)
        risk_levels = [f.risk_level for f in context.file_results]
        overall_risk = "UNKNOWN"
        for level in RISK_PRIORITY:
            if level in risk_levels:
                overall_risk = level
                break

        total_expected_loss = round(
            sum(f.expected_cost for f in context.file_results), 2
        )
        confidence = CONFIDENCE_MAP.get(overall_risk, 0.50)

        summary = Summary(
            overall_risk=overall_risk,
            expected_loss=total_expected_loss,
            confidence=confidence,
        )

        # Flatten all signals from all files for the top-level signal list
        all_signals: list[SignalOutput] = []
        seen: set[str] = set()
        for file_result in context.file_results:
            for signal in file_result.signals:
                if signal.name not in seen:
                    all_signals.append(signal)
                    seen.add(signal.name)

        # Strip per-file signals from FileResult before returning
        # (they're already in all_signals at the top level)
        clean_files = []
        for file_result in context.file_results:
            file_result.signals = []
            clean_files.append(file_result)

        response = AnalysisResponse(
            summary=summary,
            files=clean_files,
            agent_logs=context.agent_logs,
            signals=all_signals,
        )

        # Store the final response on the context for the orchestrator to retrieve
        context.config["final_response"] = response

        context.log(self.name, "done")
        return context
