from backend.agents.base import BaseAgent
from backend.models.schemas import FileMetrics, FileResult, PipelineContext
from backend.signals.base import BaseSignal
from backend.signals.complexity import ComplexitySignal
from backend.signals.commit_frequency import CommitFrequencySignal


# ---------------------------------------------------------------------------
# Signal Registry — add new signal classes here to extend the analyzer
# ---------------------------------------------------------------------------
SIGNAL_REGISTRY: list[BaseSignal] = [
    ComplexitySignal(),
    CommitFrequencySignal(),
]


class AnalyzerAgent(BaseAgent):
    """
    Loops through raw files, runs all registered signals against each file,
    and builds FileResult objects stored in context.file_results.
    """

    @property
    def name(self) -> str:
        return "Analyzer"

    async def run(self, context: PipelineContext) -> PipelineContext:
        context.log(self.name, "running")

        file_results: list[FileResult] = []

        for raw_file in context.raw_files:
            signals = []
            for signal in SIGNAL_REGISTRY:
                output = await signal.compute(target=raw_file)
                signals.append(output)

            # Extract signal values for the metrics object
            complexity_val = next((s.value for s in signals if s.name == "Complexity"), 0)
            commits_val = next((s.value for s in signals if s.name == "Commit Frequency"), 0)

            file_results.append(
                FileResult(
                    name=raw_file.name,
                    metrics=FileMetrics(
                        complexity=complexity_val,
                        commits=commits_val,
                    ),
                    signals=signals,
                )
            )

        context.file_results = file_results
        context.log(self.name, "done")
        return context
