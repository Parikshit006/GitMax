from urllib.parse import urlparse
from backend.tools.providers import RepoProvider, GitHubProvider, GitLabProvider

def get_provider(repo_url: str) -> RepoProvider:
    """
    Factory pattern that auto-detects the provider natively from the payload URL domain.
    Defaults to GitHubProvider if ambiguous.
    """
    parsed = urlparse(repo_url)
    hostname = parsed.hostname or ""
    
    if "gitlab" in hostname.lower():
        return GitLabProvider()
        
    return GitHubProvider()
