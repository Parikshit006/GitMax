from typing import Any

from backend.models.schemas import SignalOutput
from backend.signals.base import BaseSignal
from backend.tools.radon_calc import calculate_complexity


class ComplexitySignal(BaseSignal):
    """
    Computes the cyclomatic complexity score for a given target.
    """

    @property
    def name(self) -> str:
        return "Complexity"

    async def compute(self, target: Any, **kwargs: Any) -> SignalOutput:
        code_content = getattr(target, 'content', '')
        
        # Calculate cyclomatic complexity
        complexity_val = calculate_complexity(code_content)
        
        # Simple threshold check to assign a status level
        if complexity_val >= 15:
            status = "HIGH"
        elif complexity_val >= 8:
            status = "MEDIUM"
        else:
            status = "LOW"

        return SignalOutput(
            name=self.name,
            value=complexity_val,
            status=status
        )
