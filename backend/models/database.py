import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, Float, Numeric, DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship, Mapped, mapped_column
from backend.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider: Mapped[str] = mapped_column(String, nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    
    __table_args__ = (UniqueConstraint('provider', 'provider_user_id', name='uq_usr_prov_id'),)

class Repository(Base):
    __tablename__ = 'repositories'
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String, nullable=False)
    repo_name: Mapped[str] = mapped_column(String, nullable=False)
    repo_full_name: Mapped[str] = mapped_column(String, nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)

class PullRequest(Base):
    __tablename__ = 'pull_requests'
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('repositories.id', ondelete="CASCADE"), index=True)
    pr_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    
    __table_args__ = (UniqueConstraint('repo_id', 'pr_number', name='uq_repo_pr'),)

class AnalysisLog(Base):
    __tablename__ = 'analysis_logs'
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete="CASCADE"), index=True)
    repo_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('repositories.id', ondelete="CASCADE"))
    pr_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('pull_requests.id', ondelete="CASCADE"), index=True)
    top_file: Mapped[str] = mapped_column(String, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer)
    expected_loss: Mapped[float] = mapped_column(Numeric, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)
    summary_text: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, index=True)

    pr = relationship("PullRequest", lazy="joined")
    repo = relationship("Repository", lazy="joined")
