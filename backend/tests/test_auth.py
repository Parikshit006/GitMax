from datetime import timedelta
import jwt
import pytest
from fastapi import HTTPException
from backend.auth.security import create_access_token, decode_token, SECRET_KEY

def test_create_access_token():
    """Proves the JWT is algorithmically wrapped with matching provider structure."""
    data = {"provider": "github", "access_token": "super-secret"}
    token = create_access_token(data)
    
    # decode cleanly using PyJWT
    decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    assert decoded["provider"] == "github"
    assert decoded["access_token"] == "super-secret"
    assert "exp" in decoded

def test_decode_token_invalid():
    """Proves the API intercepts natively broken credentials safely."""
    with pytest.raises(HTTPException) as exc:
        decode_token("fake.jwt.token")
    assert exc.value.status_code == 401
    assert "Invalid authentication token" in exc.value.detail
