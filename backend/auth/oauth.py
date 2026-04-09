import httpx
from fastapi import HTTPException
import os

async def exchange_github_code(code: str) -> str:
    client_id = os.environ.get("GITHUB_CLIENT_ID")
    client_secret = os.environ.get("GITHUB_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="GitHub Client configuration missing")

    url = "https://github.com/login/oauth/access_token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code
    }
    headers = {"Accept": "application/json"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data, headers=headers)
        response.raise_for_status()
        res_json = response.json()
        
        token = res_json.get("access_token")
        if not token:
            raise HTTPException(status_code=400, detail=f"Bad OAuth exchange: {res_json}")
        return token

async def exchange_gitlab_code(code: str) -> str:
    client_id = os.environ.get("GITLAB_CLIENT_ID")
    client_secret = os.environ.get("GITLAB_CLIENT_SECRET")
    redirect_uri = os.environ.get("GITLAB_REDIRECT_URI", "http://127.0.0.1:8000/auth/gitlab/callback")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="GitLab Client configuration missing")

    url = "https://gitlab.com/oauth/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=data)
        response.raise_for_status()
        res_json = response.json()
        
        token = res_json.get("access_token")
        if not token:
            raise HTTPException(status_code=400, detail="GitLab OAuth exchange failed")
        return token
