from abc import ABC, abstractmethod
from typing import Any

from backend.models.schemas import SignalOutput


class BaseSignal(ABC):
    """
    Abstract base class for all signals in the system.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the signal."""
        pass

    @abstractmethod
    async def compute(self, target: Any, **kwargs: Any) -> SignalOutput:
        """
        Compute the signal value and status based on the provided target.
        
        Args:
            target: The entity to compute the signal for (e.g., file path, PR Context).
            **kwargs: Additional parameters needed for computation.
            
        Returns:
            SignalOutput: The computed signal payload.
        """
        pass
