from abc import ABC, abstractmethod
from backend.models.schemas import PipelineContext


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the pipeline.

    Each agent receives the shared PipelineContext, mutates it,
    and returns it for the next agent in the chain.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable agent name."""
        pass

    @abstractmethod
    async def run(self, context: PipelineContext) -> PipelineContext:
        """
        Execute the agent's logic.

        Args:
            context: The shared pipeline context.

        Returns:
            PipelineContext: The updated context (mutated in place).
        """
        pass
