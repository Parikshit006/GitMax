import httpx
from urllib.parse import urlparse
from typing import List, Dict

def parse_gitlab_url(repo_url: str):
    """Parses 'https://gitlab.com/owner/repo' into 'owner/repo' path."""
    parsed = urlparse(repo_url)
    path = parsed.path.strip("/")
    return path

async def fetch_gitlab_pr_files(repo_url: str, pr_number: int, token: str = None) -> List[Dict]:
    """
    Fetches the files modified in a GitLab MR (Merge Request) and their contents.
    Falls back to dummy data if token is not provided or API call fails.
    """
    MOCK_FILES = [
        {
            "name": "auth.py",
            "content": "def login(user, password):\n    pass\n",
            "commit_count": 45,
            "language": "python",
        }
    ]

    if not token:
        print("GitLab token is missing. Falling back to dummy data.")
        return MOCK_FILES

    project_path = parse_gitlab_url(repo_url)
    # GitLab uses url-encoded project paths like owner%2Frepo
    encoded_project = httpx.utils.quote(project_path, safe='')
    
    # Endpoint to get MR changes
    api_url = f"https://gitlab.com/api/v4/projects/{encoded_project}/merge_requests/{pr_number}/changes"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, headers=headers, timeout=10)
            response.raise_for_status()
            mr_data = response.json()

            changes = mr_data.get("changes", [])
            results = []
            
            for file in changes:
                file_name = file.get("new_path", "unknown")
                # GitLab provides diffs internally. We can use a mock 'proxy' for commit count
                commit_count = len(mr_data.get("commits", []))
                
                # Fetching raw file content via repository/files endpoint
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

    except Exception as e:
        print(f"GitLab API Error: {e}. Falling back to dummy data.")
        return MOCK_FILES
