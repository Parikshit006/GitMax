import pytest
from backend.models.schemas import PipelineContext, PRRequest, FileResult, SignalOutput
from backend.agents.risk import RiskAgent
from backend.agents.cost import CostAgent

@pytest.mark.asyncio
async def test_risk_health_score_calculation():
    """Isolates the Risk Agent proving mathematical health score deductions are absolute."""
    ctx = PipelineContext(
        run_id="test-123",
        pr_request=PRRequest(repo_url="mock_test", pr_number=1)
    )
    
    # Pre-populate dummy signal data that Analyzer Agent usually yields
    file_res = FileResult(
        name="test.py",
        expected_cost=0.0,
        signals=[
            SignalOutput(name="Complexity", value=100.0, status="HIGH"),
            SignalOutput(name="Commit Frequency", value=50.0, status="HIGH"),
        ]
    )
    ctx.file_results.append(file_res)
    
    agent = RiskAgent()
    out_ctx = await agent.run(ctx)
    
    res = out_ctx.file_results[0]
    
    # Extremely heavy complexity + churn = Automatic HIGH risk failure constraint
    assert res.risk_level == "HIGH"
    assert "REJECT" in res.recommendation
    
    health_signal = next((s for s in res.signals if s.name == "Health Score"), None)
    assert health_signal is not None
    assert health_signal.value < 10 # Should be heavily penalized to around 5

@pytest.mark.asyncio
async def test_cost_agent_math():
    """Isolates the Cost Agent ensuring exactly expected SLA metrics multiply properly."""
    ctx = PipelineContext(
        run_id="test-cost",
        pr_request=PRRequest(repo_url="mock", pr_number=2)
    )
    
    file_res = FileResult(
        name="finance.py",
        expected_cost=0.0,
        risk_level="HIGH"
    )
    ctx.file_results.append(file_res)
    
    agent = CostAgent()
    out_ctx = await agent.run(ctx)
    
    # 65% probability multiplied by $100k Base SLA = exactly $65,000
    assert out_ctx.file_results[0].expected_cost == 65000.0
