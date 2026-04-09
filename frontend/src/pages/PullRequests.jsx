import React, { useState } from 'react'
import TopBar from '../components/Layout/TopBar'
import StatCard from '../components/ui/StatCard'
import RiskBadge from '../components/ui/RiskBadge'
import RiskScoreRing from '../components/ui/RiskScoreRing'
import './PullRequests.css'

const pullRequests = [
  {
    id: 'PR-2847',
    title: 'feat: enable multi-region database replication',
    author: 'sarah.chen',
    branch: 'feat/multi-region-db',
    riskScore: 78,
    risk: 'high',
    files: 24,
    additions: 847,
    deletions: 123,
    reviewers: 3,
    labels: ['database', 'infrastructure'],
    time: '2h ago',
    description: 'Implements multi-region database replication for APAC and EU zones.',
    affectedFiles: ['/api/sync.ts', '/config/regions.ts', '/lib/replicator.ts'],
  },
  {
    id: 'PR-2846',
    title: 'refactor: optimize dashboard state management',
    author: 'mike.roberts',
    branch: 'refactor/state-mgmt',
    riskScore: 52,
    risk: 'medium',
    files: 12,
    additions: 345,
    deletions: 289,
    reviewers: 2,
    labels: ['frontend', 'performance'],
    time: '4h ago',
    description: 'Migrates global state from Context API to Zustand for better performance.',
    affectedFiles: ['useAuth', 'useStore', '/components/Dashboard.tsx'],
  },
  {
    id: 'PR-2845',
    title: 'docs: update api authentication flow diagram',
    author: 'alex.kumar',
    branch: 'docs/auth-flow',
    riskScore: 8,
    risk: 'low',
    files: 3,
    additions: 45,
    deletions: 12,
    reviewers: 1,
    labels: ['documentation'],
    time: '6h ago',
    description: 'Updates the OAuth2 flow documentation with new refresh token logic.',
    affectedFiles: ['/docs/auth.md', '/diagrams/oauth2.mmd'],
  },
  {
    id: 'PR-2844',
    title: 'fix: resolve race condition in payment processor',
    author: 'jenny.zhao',
    branch: 'fix/payment-race',
    riskScore: 65,
    risk: 'medium',
    files: 8,
    additions: 156,
    deletions: 67,
    reviewers: 2,
    labels: ['payments', 'bug-fix', 'critical'],
    time: '8h ago',
    description: 'Fixes a race condition that caused duplicate charges under high concurrency.',
    affectedFiles: ['/services/payment.ts', '/lib/mutex.ts'],
  },
]

export default function PullRequests() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="pr-page">
      <TopBar
        tabs={['Overview', 'Open', 'Merged', 'Closed']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="pr-content">
        {/* Hero */}
        <div className="pr-hero">
          <h1>Pull Requests</h1>
          <p>Risk-aware code review orchestration. Our AI analyzes architectural impact and security vulnerabilities before every merge.</p>
        </div>

        {/* Stats */}
        <div className="pr-stats">
          <StatCard icon="merge_type" label="Open PRs" value="24" color="primary" />
          <StatCard icon="speed" label="Avg Risk" value="42" change="-8.3%" changeType="down" color="secondary" />
          <StatCard icon="error" label="Critical Risks" value="3" color="error" />
          <StatCard icon="rocket_launch" label="Merge Velocity" value="2.4d" change="+12%" changeType="up" color="tertiary" />
        </div>

        {/* Pulse Banner */}
        <div className="pr-pulse">
          <div className="pr-pulse-dot" />
          <span className="pr-pulse-label">Platform Pulse</span>
          <span className="pr-pulse-text">System performance is optimal. AI risk prediction models updated 2m ago.</span>
        </div>

        {/* PR List */}
        <div className="pr-list">
          {pullRequests.map((pr, i) => (
            <div key={pr.id} className="pr-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="pr-card-left">
                <RiskScoreRing score={pr.riskScore} size={56} />
              </div>

              <div className="pr-card-main">
                <div className="pr-card-top">
                  <h4 className="pr-card-title">{pr.title}</h4>
                  <RiskBadge level={pr.risk} />
                </div>
                <p className="pr-card-desc">{pr.description}</p>
                <div className="pr-card-meta">
                  <span className="pr-card-id">{pr.id}</span>
                  <span className="pr-card-dot">·</span>
                  <span className="pr-card-author">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                    {pr.author}
                  </span>
                  <span className="pr-card-dot">·</span>
                  <span className="pr-card-branch">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>commit</span>
                    {pr.branch}
                  </span>
                  <span className="pr-card-dot">·</span>
                  <span className="pr-card-time">{pr.time}</span>
                </div>
                <div className="pr-card-tags">
                  {pr.labels.map((l) => (
                    <span key={l} className="pr-card-tag">{l}</span>
                  ))}
                </div>
              </div>

              <div className="pr-card-stats">
                <div className="pr-card-stat">
                  <span className="pr-card-stat-value">{pr.files}</span>
                  <span className="pr-card-stat-label">Files</span>
                </div>
                <div className="pr-card-stat pr-card-stat--add">
                  <span className="pr-card-stat-value">+{pr.additions}</span>
                  <span className="pr-card-stat-label">Added</span>
                </div>
                <div className="pr-card-stat pr-card-stat--del">
                  <span className="pr-card-stat-value">-{pr.deletions}</span>
                  <span className="pr-card-stat-label">Deleted</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="pr-showing">Showing {pullRequests.length} of 24 active pull requests</p>
      </div>
    </div>
  )
}
