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
        # Mock logic representing commit frequency computation
        mock_commit_count = 45
        mock_status = "HIGH"

        return SignalOutput(
            name=self.name,
            value=mock_commit_count,
            status=mock_status
        )
