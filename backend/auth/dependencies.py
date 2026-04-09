from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.auth.security import decode_token
from typing import Dict, Any

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Validates extracting the session JWT securely resolving 
    the inner structure containing the provider access token.
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    provider = payload.get("provider")
    access_token = payload.get("access_token")

    if not provider or not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session payload invalid or corrupted",
        )
        
    return payload
