import os
import requests
import re
from urllib.parse import urlparse
from typing import List, Dict

def parse_github_url(repo_url: str):
    """Parses 'https://github.com/owner/repo' into ('owner', 'repo')."""
    parsed = urlparse(repo_url)
    path_parts = parsed.path.strip("/").split("/")
    if len(path_parts) >= 2:
        return path_parts[0], path_parts[1]
    return None, None

def fetch_pr_files(repo_url: str, pr_number: int, token: str = None) -> List[Dict]:
    """
    Fetches the files modified in a GitHub PR and their contents.
    Falls back to dummy data if token is not provided or API call fails.
    """
    MOCK_FILES = [
        {
            "name": "auth.py",
            "content": "def login(user, password):\n    pass\n",
            "commit_count": 45,
            "language": "python",
        },
        {
            "name": "utils.py",
            "content": "def helper():\n    pass\n",
            "commit_count": 12,
            "language": "python",
        },
    ]

    if not token:
        # Fallback if no token is available to avoid API limits/401s
        print("GitHub token is missing. Falling back to dummy data.")
        return MOCK_FILES

    owner, repo = parse_github_url(repo_url)
    if not owner or not repo:
        print("Failed to parse GitHub repo URL. Falling back to dummy data.")
        return MOCK_FILES

    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {token}"
    }

    try:
        response = requests.get(api_url, headers=headers, timeout=10)
        response.raise_for_status()
        files = response.json()

        results = []
        for file in files:
            file_name = file.get("filename", "unknown")
            changes = file.get("changes", 0)  # Using changes as proxy for commit count
            raw_url = file.get("raw_url")
            
            content = ""
            if raw_url:
                c_resp = requests.get(raw_url, headers=headers, timeout=10)
                if c_resp.status_code == 200:
                    content = c_resp.text
            
            results.append({
                "name": file_name,
                "content": content,
                "commit_count": changes,  # Proxy
                "language": file_name.split(".")[-1] if "." in file_name else "unknown"
            })
            
        return results

    except Exception as e:
        print(f"GitHub API Error: {e}. Falling back to dummy data.")
        return MOCK_FILES
