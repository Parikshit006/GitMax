from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.models.database import User, Repository, PullRequest, AnalysisLog

async def log_analysis_result(db: AsyncSession, user_data: dict, repo_url: str, pr_number: int, analysis_resp: dict):
    """
    Safely executes dynamic Upserts into the SQLite boundaries protecting pipelines.
    Using explicit select+update checks instead of postgres native `insert().on_conflict_do_update`
    to maintain strict compatibility locally across SQLite and PostgreSQL effortlessly!
    """
    # 1. UPSERT USER
    user_q = await db.execute(select(User).filter_by(provider=user_data['provider'], provider_user_id=user_data['id']))
    user_obj = user_q.scalar_one_or_none()
    if not user_obj:
        user_obj = User(
            provider=user_data['provider'],
            provider_user_id=user_data['id'],
            username=user_data.get('username', 'Anonymous'),
            avatar_url=user_data.get('avatar_url', '')
        )
        db.add(user_obj)
    await db.flush()

    # 2. UPSERT REPOSITORY
    # Ex: repo_url typically looks like 'https://github.com/owner/repo'
    full_name_rough = "/".join(repo_url.strip("/").split("/")[-2:])
    repo_name_rough = full_name_rough.split("/")[-1]

    repo_q = await db.execute(select(Repository).filter_by(repo_full_name=full_name_rough, user_id=user_obj.id))
    repo_obj = repo_q.scalar_one_or_none()
    if not repo_obj:
        repo_obj = Repository(
            user_id=user_obj.id,
            provider=user_data['provider'],
            repo_name=repo_name_rough,
            repo_full_name=full_name_rough,
            is_private=False
        )
        db.add(repo_obj)
    await db.flush()

    # 3. UPSERT PULL REQUEST
    pr_q = await db.execute(select(PullRequest).filter_by(repo_id=repo_obj.id, pr_number=pr_number))
    pr_obj = pr_q.scalar_one_or_none()
    if not pr_obj:
        pr_obj = PullRequest(
            repo_id=repo_obj.id,
            pr_number=pr_number,
            title=f"PR #{pr_number}",
            state="open"
        )
        db.add(pr_obj)
    await db.flush()

    # 4. INSERT ANALYSIS LOG
    worst_file_name = "unknown"
    if analysis_resp.get("files") and len(analysis_resp["files"]) > 0:
        worst_file_name = analysis_resp["files"][0].get("name", "unknown")

    summary_data = analysis_resp.get("summary", {})
    new_log = AnalysisLog(
        user_id=user_obj.id,
        repo_id=repo_obj.id,
        pr_id=pr_obj.id,
        top_file=worst_file_name,
        risk_score=int(summary_data.get("confidence", 0.0) * 100), 
        expected_loss=float(summary_data.get("expected_loss", 0.0)),
        confidence_score=float(summary_data.get("confidence", 0.0)),
        summary_text=summary_data.get("recommendation", "")
    )
    db.add(new_log)
    await db.commit()
