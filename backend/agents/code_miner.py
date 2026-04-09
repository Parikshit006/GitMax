from backend.agents.base import BaseAgent
from backend.models.schemas import PipelineContext, RawFile
from backend.tools.github import fetch_pr_files
import os


class CodeMinerAgent(BaseAgent):
    """
    Fetches files changed in a PR (mocked) and populates context.raw_files.
    In production, replace mock data with a GitHub/GitLab API call.
    """

    @property
    def name(self) -> str:
        return "Code Miner"

    async def run(self, context: PipelineContext) -> PipelineContext:
        context.log(self.name, "running")

        # Fetch token from environment or config
        token = os.environ.get("GITHUB_TOKEN", "")
        repo_url = context.pr_request.repo_url
        pr_number = context.pr_request.pr_number

        fetched_files = fetch_pr_files(repo_url=repo_url, pr_number=pr_number, token=token)

        raw_files = [
            RawFile(
                name=f["name"],
                content=f.get("content", ""),
                commit_count=f.get("commit_count", 0),
                language=f.get("language"),
            )
            for f in fetched_files
        ]

        context.raw_files = raw_files
        context.log(self.name, "done")
        return context
