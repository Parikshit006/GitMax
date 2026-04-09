import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from backend.auth.oauth import exchange_github_code, exchange_gitlab_code
from backend.auth.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/{provider}/login")
async def login(provider: str):
    """Redirects the client to the specific external OAuth gateway."""
    if provider == "github":
        client_id = os.environ.get("GITHUB_CLIENT_ID")
        return RedirectResponse(f"https://github.com/login/oauth/authorize?client_id={client_id}&scope=repo")
    
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
    if provider == "github":
        external_token = await exchange_github_code(code)
    elif provider == "gitlab":
        external_token = await exchange_gitlab_code(code)
    else:
        raise HTTPException(status_code=400, detail="Provider not supported")
        
    # Generate an internal secure session
    session_jwt = create_access_token(
        data={"provider": provider, "access_token": external_token}
    )
    
    # Normally this would set an HttpOnly cookie or return a JSON standard format
    return {"access_token": session_jwt, "token_type": "bearer", "provider": provider}
