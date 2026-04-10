import React, { useState } from 'react'
import TopBar from '../components/Layout/TopBar'
import RiskBadge from '../components/ui/RiskBadge'
import './Repositories.css'

const repos = [
  {
    name: 'core-engine',
    org: 'precision-ai/core',
    branch: 'main-production-branch',
    health: 92,
    risk: 'low',
    lastSync: '14 minutes ago',
    version: 'v4.2.0-stable',
    lang: 'TypeScript',
    stars: 842,
  },
  {
    name: 'api-gateway-v2',
    org: 'precision-ai/gateway',
    branch: 'release/stable',
    health: 68,
    risk: 'medium',
    lastSync: '1 hour ago',
    version: 'v2.1.4-rc',
    lang: 'Go',
    stars: 324,
  },
  {
    name: 'legacy-auth-service',
    org: 'precision/auth',
    branch: 'v1-deprecated',
    health: 34,
    risk: 'high',
    lastSync: '2 hours ago',
    version: 'v1.8.2',
    lang: 'Java',
    stars: 156,
  },
  {
    name: 'docs-portal',
    org: 'precision-ai/docs',
    branch: 'master',
    health: 96,
    risk: 'low',
    lastSync: '3 days ago',
    version: 'v3.0.1',
    lang: 'JavaScript',
    stars: 89,
  },
]

const healthColor = (score) => {
  if (score >= 80) return 'var(--accent-green)'
  if (score >= 50) return 'var(--accent-amber)'
  return 'var(--accent-red)'
}

export default function Repositories() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="repos-page">
      <TopBar
        tabs={['Overview', 'Repositories', 'Security']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="repos-content">
        {/* Hero */}
        <div className="repos-hero">
          <div className="repos-hero-text">
            <h1>Repositories</h1>
            <p>Monitor the health and security risk profile of your connected source code. AI-powered analysis runs in real-time across your stack.</p>
          </div>
        </div>

        {/* Top row */}
        <div className="repos-top-grid">
          {/* Source Integration Card */}
          <div className="repos-card repos-card--connect">
            <div className="repos-card-header">
              <h3>Source Integration</h3>
              <span className="repos-card-sub">Connect and sync your organization's ecosystems.</span>
            </div>
            <div className="repos-connect-grid">
              <button className="repos-connect-btn">
                <span className="material-symbols-outlined">add_circle</span>
                GitHub
              </button>
              <button className="repos-connect-btn">
                <span className="material-symbols-outlined">add_circle</span>
                GitLab
              </button>
              <button className="repos-connect-btn">
                <span className="material-symbols-outlined">add_circle</span>
                Bitbucket
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="repos-card repos-card--health">
            <div className="repos-card-header">
              <h3>System Health</h3>
              <span className="repos-card-sub">Aggregate Score</span>
            </div>
            <div className="repos-health-ring">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-container)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="var(--accent-green)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - 0.84)}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                />
              </svg>
              <div className="repos-health-ring-value">
                <span className="repos-health-number">84</span>
                <span className="repos-health-unit">%</span>
              </div>
            </div>
            <RiskBadge level="stable" label="Stable" />
          </div>
        </div>

        {/* Repository List */}
        <section className="repos-card repos-card--list">
          <div className="repos-card-header">
            <h3>Active Repositories</h3>
            <span className="repos-card-sub">Managing {repos.length} connected software entities</span>
          </div>

          <div className="repos-list">
            {repos.map((repo, i) => (
              <div key={repo.name} className="repos-item" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="repos-item-left">
                  <div className="repos-item-icon">
                    <span className="material-symbols-outlined">folder_open</span>
                  </div>
                  <div className="repos-item-info">
                    <div className="repos-item-name">{repo.name}</div>
                    <div className="repos-item-meta">
                      <span className="repos-item-org">{repo.org}</span>
                      <span className="repos-item-dot">·</span>
                      <span className="repos-item-branch">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>commit</span>
                        {repo.branch}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="repos-item-center">
                  <div className="repos-item-health-bar">
                    <div className="repos-item-health-fill" style={{ width: `${repo.health}%`, background: healthColor(repo.health) }} />
                  </div>
                  <span className="repos-item-health-label" style={{ color: healthColor(repo.health) }}>
                    {repo.health}%
                  </span>
                </div>

                <div className="repos-item-right">
                  <RiskBadge level={repo.risk} />
                  <span className="repos-item-sync">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    {repo.lastSync}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Cards */}
        <div className="repos-bottom-grid">
          <div className="repos-card repos-card--custom">
            <span className="material-symbols-outlined repos-card-big-icon">terminal</span>
            <h3>Add Custom Source</h3>
            <p>Connect specialized registries or proprietary git systems via our enterprise CLI or direct API access.</p>
            <button className="repos-cta-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Connect Source
            </button>
          </div>
          <div className="repos-card repos-card--auto">
            <span className="material-symbols-outlined repos-card-big-icon">auto_fix_high</span>
            <h3>Auto-Remediation</h3>
            <p>Let Git Max AI suggest and open PRs for high-priority security patches automatically.</p>
            <button className="repos-cta-btn repos-cta-btn--secondary">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
              Enable Auto-Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
