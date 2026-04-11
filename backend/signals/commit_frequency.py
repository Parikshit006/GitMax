from typing import Any

from backend.models.schemas import SignalOutput
from backend.signals.base import BaseSignal


class CommitFrequencySignal(BaseSignal):
    """
    Computes the commit frequency metric for a given target.
    """

    @property
    def name(self) -> str:
        return "Commit Frequency"

    async def compute(self, target: Any, **kwargs: Any) -> SignalOutput:
        # Utilize the REAL commit count extracted via PyDriller in the miner stage
        actual_count = getattr(target, 'commit_count', 0)
        
        # Simple threshold check to assign a status level
        if actual_count >= 30:
            status = "HIGH"
        elif actual_count >= 15:
            status = "MEDIUM"
        else:
            status = "LOW"

        return SignalOutput(
            name=self.name,
            value=actual_count,
            status=status
        )
