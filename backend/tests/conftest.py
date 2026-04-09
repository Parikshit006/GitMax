import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.dependencies import get_current_user

# Mock dependency payload to bypass dynamic GitHub OAuth in strict test environments
def mock_get_current_user():
    return {
        "provider": "github",
        "access_token": "mock-test-token"
    }

# Inject the mocked dependency overriding the app's real security endpoints
app.dependency_overrides[get_current_user] = mock_get_current_user

@pytest.fixture
def client():
    """Generates the isolated FastAPI testing sandbox client."""
    return TestClient(app)
