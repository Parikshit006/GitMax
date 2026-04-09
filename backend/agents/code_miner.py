from backend.agents.base import BaseAgent
from backend.models.schemas import PipelineContext, RawFile
from backend.tools.github import fetch_pr_files
from backend.tools.gitlab import fetch_gitlab_pr_files
from pydriller import Repository
from datetime import datetime, timedelta
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

        # Dynamic Auth Token from pipeline context
        token = context.auth_token
        provider = context.auth_provider
        repo_url = context.pr_request.pr_number # wait, it's context.pr_request.repo_url 
        repo_url = context.pr_request.repo_url
        pr_number = context.pr_request.pr_number

        # 1. Fetch changed files from the PR via REST APIs
        if provider == "gitlab":
            fetched_files = await fetch_gitlab_pr_files(repo_url=repo_url, pr_number=pr_number, token=token)
        else:
            # Default to GitHub natively
            fetched_files = fetch_pr_files(repo_url=repo_url, pr_number=pr_number, token=token)

        modified_filenames = [f["name"] for f in fetched_files]

        # 2. Use PyDriller to determine historical 'bug churn' of those specific files
        # We enforce a 90-day restricted window to optimize clone times
        repo_commits: dict[str, int] = {}
        ninety_days_ago = datetime.now() - timedelta(days=90)
        
        try:
            if modified_filenames:
                context.log(self.name, f"Running PyDriller traversal on modified files (90-day window)...")
                repo = Repository(repo_url, filepath=modified_filenames, since=ninety_days_ago)
                
                # This explicitly iterates over Git history pulling active commit metadata
                for commit in repo.traverse_commits():
                    for modified_file in commit.modified_files:
                        fname = modified_file.new_path or modified_file.old_path
                        if fname in modified_filenames:
                            repo_commits[fname] = repo_commits.get(fname, 0) + 1
                            
        except Exception as e:
            context.log(self.name, f"PyDriller constraint gracefully handled: {str(e)}")

        raw_files = [
            RawFile(
                name=f["name"],
                content=f.get("content", ""),
                # Binds REAL PyDriller data if acquired, otherwise falls back to basic heuristics
                commit_count=repo_commits.get(f["name"], f.get("commit_count", 0)),
                language=f.get("language"),
            )
            for f in fetched_files
        ]

        context.raw_files = raw_files
        context.log(self.name, "done")
        return context
