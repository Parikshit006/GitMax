"""
Pydantic models for the GitMax PR analysis pipeline.
Reflects the expected JSON structure for Analysis results.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Internal Context / Requests
# ---------------------------------------------------------------------------

class PRRequest(BaseModel):
    """Incoming pull-request analysis request."""
    repo_url: str = Field(..., description="Full URL of the repository")
    pr_number: int = Field(..., description="Pull-request number to analyse")
    branch: Optional[str] = None
    base_branch: Optional[str] = "main"
    company_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Company configuration passed from the UI")


# ---------------------------------------------------------------------------
# JSON Response Components
# ---------------------------------------------------------------------------

class Summary(BaseModel):
    """High-level summary of the entire PR analysis."""
    overall_risk: str = Field(..., description="E.g., HIGH, MEDIUM, LOW")
    expected_loss: float = Field(..., description="Expected monetary or metric loss")
    confidence: float = Field(..., description="Confidence score 0-1")
    recommendation: Optional[str] = None


class FileMetrics(BaseModel):
    """Quantitative metrics computed for a single file."""
    complexity: int
    commits: int


class FileResult(BaseModel):
    """Analysis result for a single file changed in the PR."""
    name: str = Field(..., description="File name or path")
    risk_level: str = Field(default="UNKNOWN")
    expected_cost: float = Field(default=0.0)
    metrics: FileMetrics = Field(default_factory=lambda: FileMetrics(complexity=0, commits=0))
    reasons: List[str] = Field(default_factory=list)
    recommendation: Optional[str] = None
    signals: List["SignalOutput"] = Field(default_factory=list)


class AgentLog(BaseModel):
    """Execution log entry for a single agent run."""
    agent: str = Field(..., description="Name of the agent")
    status: str = Field(..., description="Status string (e.g., done, failed, running)")


class SignalOutput(BaseModel):
    """A single signal emitted by an agent."""
    name: str = Field(..., description="Name of the signal")
    value: Union[int, float, str] = Field(..., description="Numeric or string value of the signal")
    status: str = Field(..., description="Status or level of the signal (e.g., HIGH)")


class AnalysisResponse(BaseModel):
    """Top-level response returned by the analysis API matching JSON schema."""
    summary: Summary
    files: List[FileResult] = Field(default_factory=list)
    agent_logs: List[AgentLog] = Field(default_factory=list)
    signals: List[SignalOutput]

class HistoryResponse(BaseModel):
    id: str
    created_at: Any
    top_file: str
    risk_score: int
    expected_loss: float
    summary: str

class RepoResponse(BaseModel):
    name: str
    owner: str
    is_private: bool
    language: Optional[str] = "Python"
    stars: Optional[int] = 0
    updated_at: Optional[str] = None


class PRListResponse(BaseModel):
    pr_number: int
    title: str
    state: str
    html_url: str = Field(default_factory=list)
    author: Optional[str] = None
    branch: Optional[str] = None
    created_at: Optional[str] = None
    additions: Optional[int] = 0
    deletions: Optional[int] = 0



# ---------------------------------------------------------------------------
# Pipeline Context — shared state threaded through all agents
# ---------------------------------------------------------------------------

class RawFile(BaseModel):
    """Raw file data fetched by CodeMinerAgent."""
    name: str
    content: str
    commit_count: int
    language: Optional[str] = None


class PipelineContext(BaseModel):
    """Shared context object threaded through the entire pipeline."""
    run_id: str
    pr_request: PRRequest
    config: Dict[str, Any] = Field(default_factory=dict)
    auth_provider: Optional[str] = None
    auth_token: Optional[str] = None

    # Populated by CodeMinerAgent
    raw_files: List[RawFile] = Field(default_factory=list)

    # Populated progressively by Analyzer → Risk → Cost agents
    file_results: List[FileResult] = Field(default_factory=list)

    # Accumulated by all agents
    agent_logs: List[AgentLog] = Field(default_factory=list)

    def log(self, agent_name: str, status: str) -> None:
        """Convenience method to append an AgentLog entry."""
        self.agent_logs.append(AgentLog(agent=agent_name, status=status))
