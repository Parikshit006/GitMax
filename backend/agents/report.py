from backend.agents.base import BaseAgent
from backend.models.schemas import (
    AnalysisResponse,
    PipelineContext,
    SignalOutput,
    Summary,
)
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate

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
        
        # Gather health scores derived explicitly during RiskAgent execution
        health_scores = [
            int(s.value) for f in context.file_results for s in f.signals if s.name == "Health Score"
        ]

        # LangChain Integration: Generate the CEO Business-Impact Summary
        ceo_recommendation = "Review system risk parameters and mitigate technical debt proactively."
        try:
            llm = ChatGroq(
                temperature=0.7, 
                model_name="llama-3.1-8b-instant", 
                api_key=os.environ.get("GROQ_API_KEY", "mock_key")
            )
            prompt = PromptTemplate(
                input_variables=["risk", "loss", "scores"],
                template=(
                    "You are a predictive engineering AI reporting to a non-technical CEO. "
                    "System Risk: {risk}. Cost of Inaction: ${loss}. Component Health Scores: {scores}. "
                    "Write a 3-sentence executive summary emphasizing the financial cost of inaction in time and money, "
                    "and highlighting components most likely to cause slowdowns in the next 90 days."
                )
            )
            
            chain = prompt | llm
            # Fire the async LLM call
            # Note: We wrap in try-except so if GROQ_API_KEY is missing, it skips gracefully without crashing the API
            if os.environ.get("GROQ_API_KEY"):
                res = await chain.ainvoke({"risk": overall_risk, "loss": total_expected_loss, "scores": health_scores})
                ceo_recommendation = res.content
        except Exception as e:
            context.log(self.name, f"LangChain LLM Error defaults triggered. {str(e)}")

        summary = Summary(
            overall_risk=overall_risk,
            expected_loss=total_expected_loss,
            confidence=confidence,
        )
        # We overload the top-level 'recommendation' or highlights depending on structure
        summary.recommendation = ceo_recommendation

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
