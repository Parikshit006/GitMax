from abc import ABC, abstractmethod
from typing import List, Dict
import httpx
from urllib.parse import urlparse

class RepoProvider(ABC):
    """Abstract interface defining standard Git remote API extraction."""
    @abstractmethod
    async def fetch_pr_files(self, repo_url: str, pr_number: int, token: str) -> List[Dict]:
        pass

class GitHubProvider(RepoProvider):
    async def fetch_pr_files(self, repo_url: str, pr_number: int, token: str) -> List[Dict]:
        parsed = urlparse(repo_url)
        path_parts = parsed.path.strip("/").split("/")
        if len(path_parts) < 2:
            raise ValueError("Invalid GitHub URL")
            
        owner, repo = path_parts[0], path_parts[1]
        api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files"
        
        headers = {"Accept": "application/vnd.github.v3+json"}
        if token:
            headers["Authorization"] = f"token {token}"

        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, headers=headers, timeout=10)
            response.raise_for_status()
            files = response.json()

            results = []
            for file in files:
                file_name = file.get("filename", "unknown")
                changes = file.get("changes", 0)
                raw_url = file.get("raw_url")
                
                content = ""
                if raw_url:
                    c_resp = await client.get(raw_url, headers=headers, timeout=10)
                    if c_resp.status_code == 200:
                        content = c_resp.text
                
                results.append({
                    "name": file_name,
                    "content": content,
                    "commit_count": changes,
                    "language": file_name.split(".")[-1] if "." in file_name else "unknown"
                })
            return results

class GitLabProvider(RepoProvider):
    async def fetch_pr_files(self, repo_url: str, pr_number: int, token: str) -> List[Dict]:
        parsed = urlparse(repo_url)
        project_path = parsed.path.strip("/")
        encoded_project = httpx.utils.quote(project_path, safe='')
        
        api_url = f"https://gitlab.com/api/v4/projects/{encoded_project}/merge_requests/{pr_number}/changes"
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, headers=headers, timeout=10)
            response.raise_for_status()
            mr_data = response.json()

            changes = mr_data.get("changes", [])
            results = []
            
            for file in changes:
                file_name = file.get("new_path", "unknown")
                commit_count = len(mr_data.get("commits", []))
                
                # Fetch raw content
                file_url = f"https://gitlab.com/api/v4/projects/{encoded_project}/repository/files/{file_name}/raw?ref={mr_data.get('target_branch')}"
                c_resp = await client.get(file_url, headers=headers, timeout=10)
                
                content = ""
                if c_resp.status_code == 200:
                    content = c_resp.text
                
                results.append({
                    "name": file_name,
                    "content": content,
                    "commit_count": commit_count,
                    "language": file_name.split(".")[-1] if "." in file_name else "unknown"
                })
            return results
