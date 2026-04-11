import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
import httpx
from backend.auth.oauth import exchange_github_code, exchange_gitlab_code
from backend.auth.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/{provider}/login")
async def login(provider: str):
    """Redirects the client to the specific external OAuth gateway."""
    if provider == "github":
        client_id = os.environ.get("GITHUB_CLIENT_ID")
        return RedirectResponse(f"https://github.com/login/oauth/authorize?client_id={client_id}&scope=repo&prompt=select_account")
    
    elif provider == "gitlab":
        client_id = os.environ.get("GITLAB_CLIENT_ID")
        redirect_uri = os.environ.get("GITLAB_REDIRECT_URI", "http://127.0.0.1:8000/auth/gitlab/callback")
        return RedirectResponse(
            f"https://gitlab.com/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=read_api"
        )
    else:
        raise HTTPException(status_code=400, detail="Provider not supported")

@router.get("/{provider}/callback")
async def auth_callback(provider: str, code: str):
    """Consumes the OAuth code redirect, verifies via server-to-server handshake, and mints internal JWT."""
    username = "user"
    avatar_url = ""
    provider_user_id = None

    if provider == "github":
        external_token = await exchange_github_code(code)
        async with httpx.AsyncClient() as client:
            res = await client.get("https://api.github.com/user", headers={
                "Authorization": f"Bearer {external_token}",
                "Accept": "application/vnd.github.v3+json"
            })
            if res.status_code == 200:
                user_data = res.json()
                username = user_data.get("login", "user")
                avatar_url = user_data.get("avatar_url", "")
                provider_user_id = str(user_data.get("id"))
    elif provider == "gitlab":
        external_token = await exchange_gitlab_code(code)
        async with httpx.AsyncClient() as client:
            res = await client.get("https://gitlab.com/api/v4/user", headers={
                "Authorization": f"Bearer {external_token}"
            })
            if res.status_code == 200:
                user_data = res.json()
                username = user_data.get("username", "user")
                avatar_url = user_data.get("avatar_url", "")
                provider_user_id = str(user_data.get("id"))
    else:
        raise HTTPException(status_code=400, detail="Provider not supported")
        
    # Generate an internal secure session
    session_jwt = create_access_token(
        data={
            "provider": provider, 
            "access_token": external_token,
            "username": username,
            "avatar_url": avatar_url,
            "id": provider_user_id
        }
    )
    
    # Normally this would set an HttpOnly cookie or return a JSON standard format
    # Redirecting to frontend for Vite integration
    from backend.config import settings
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={session_jwt}&provider={provider}"
    return RedirectResponse(redirect_url)
