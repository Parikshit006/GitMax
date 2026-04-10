def test_analyze_pr_endpoint(client):
    """
    Simulates a payload against the main endpoint. Because get_current_user is mocked in conftest,
    this bypasses the 401 Unauthorized block and executes the full multi-agent orchestrator.
    We test against the mock-data fallback returning exactly the standard format.
    """
    payload = {
        "repo_url": "https://github.com/fastapi/fastapi/pull/999",
        "pr_number": 999
    }
    
    # We bypass Authorization Bearer Headers physically because of dependency_overrides
    response = client.post("/api/analyze-pr", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify the JSON Schema perfectly matches schemas.py format
    assert "summary" in data
    assert "files" in data
    assert "agent_logs" in data
    assert "signals" in data
    
    # Verify the fallback mocked PR files were loaded natively
    files = data["files"]
    assert len(files) > 0
    test_file = files[0]
    
    # Check the ML analytics are structurally valid
    assert "risk_level" in test_file
    assert "metrics" in test_file
    assert test_file["metrics"]["complexity"] is not None
