import React, { useState } from 'react'
import TopBar from '../components/Layout/TopBar'
import StatCard from '../components/ui/StatCard'
import RiskBadge from '../components/ui/RiskBadge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts'
import './Dashboard.css'

const riskTrendData = [
  { day: 'Mon', risk: 42, resolved: 38 },
  { day: 'Tue', risk: 38, resolved: 35 },
  { day: 'Wed', risk: 45, resolved: 40 },
  { day: 'Thu', risk: 52, resolved: 44 },
  { day: 'Fri', risk: 48, resolved: 46 },
  { day: 'Sat', risk: 35, resolved: 34 },
  { day: 'Sun', risk: 30, resolved: 28 },
  { day: 'Mon', risk: 33, resolved: 30 },
  { day: 'Tue', risk: 28, resolved: 27 },
  { day: 'Wed', risk: 32, resolved: 31 },
  { day: 'Thu', risk: 25, resolved: 24 },
  { day: 'Fri', risk: 22, resolved: 21 },
]

const riskyRepos = [
  { name: 'legacy-auth-service', risk: 'high', score: 87, issues: 14, trend: 'up', lang: 'TypeScript' },
  { name: 'payment-gateway-v2', risk: 'high', score: 74, issues: 9, trend: 'up', lang: 'Go' },
  { name: 'api-v3-internal', risk: 'medium', score: 52, issues: 6, trend: 'down', lang: 'Python' },
  { name: 'user-service', risk: 'medium', score: 45, issues: 4, trend: 'stable', lang: 'Java' },
  { name: 'docs-portal', risk: 'low', score: 12, issues: 1, trend: 'down', lang: 'JavaScript' },
]

const agentLogs = [
  {
    agent: 'Repo Agent',
    icon: 'smart_toy',
    color: 'primary',
    message: 'Scanning api-v3-internal for structural drift and deprecated dependencies.',
    time: '2m ago',
    status: 'active',
  },
  {
    agent: 'Risk Agent',
    icon: 'security',
    color: 'secondary',
    message: 'Correlating 5 new alerts with historical failure patterns in CI/CD pipeline.',
    time: '8m ago',
    status: 'active',
  },
  {
    agent: 'Report Agent',
    icon: 'analytics',
    color: 'tertiary',
    message: 'Next automated executive summary scheduled for Monday, 09:00 AM.',
    time: '15m ago',
    status: 'idle',
  },
]

const tabs = ['Overview', 'Repositories', 'Security', 'Activity']

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="dashboard-page">
      <TopBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="dashboard-content">
        {/* Scanning Banner */}
        <div className="dashboard-banner">
          <div className="dashboard-banner-icon">
            <span className="material-symbols-outlined animate-pulse">radar</span>
          </div>
          <div className="dashboard-banner-text">
            <strong>Analysis in progress</strong>
            <span>Scanning fintech-api-gateway for critical vulnerabilities...</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="dashboard-stats">
          <StatCard icon="inventory_2" label="Total Repositories" value="142" color="primary" />
          <StatCard icon="health_and_safety" label="Health Score" value="84%" change="+2.1%" changeType="up" color="tertiary" />
          <StatCard icon="warning" label="High-Risk Modules" value="12" change="-3" changeType="down" color="error" />
          <StatCard icon="notifications_active" label="Recent Alerts" value="5" color="secondary" />
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Risk Trend Chart */}
          <section className="dashboard-card dashboard-card--chart">
            <div className="dashboard-card-header">
              <h3>Risk Trend Evolution</h3>
              <span className="dashboard-card-sub">Vulnerability exposure over the last 30 days</span>
            </div>
            <div className="dashboard-chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--outline)', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--outline)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-container-lowest)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 20px rgba(22,28,34,0.08)',
                      fontSize: '13px',
                    }}
                  />
                  <Area type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={2.5} fill="url(#riskGrad)" dot={false} />
                  <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} fill="url(#resolvedGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="dashboard-chart-legend">
              <span className="dashboard-legend-item"><span className="dashboard-legend-dot" style={{ background: '#3B82F6' }} /> Risk Score</span>
              <span className="dashboard-legend-item"><span className="dashboard-legend-dot" style={{ background: '#10B981' }} /> Resolved</span>
            </div>
          </section>

          {/* AI Agent Activity */}
          <section className="dashboard-card dashboard-card--agents">
            <div className="dashboard-card-header">
              <h3>AI Agent Activity</h3>
            </div>
            <div className="dashboard-agent-list">
              {agentLogs.map((log, i) => (
                <div key={i} className={`dashboard-agent-log dashboard-agent-log--${log.color}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`dashboard-agent-avatar dashboard-agent-avatar--${log.color}`}>
                    <span className="material-symbols-outlined">{log.icon}</span>
                  </div>
                  <div className="dashboard-agent-info">
                    <div className="dashboard-agent-name">
                      {log.agent}
                      <span className={`dashboard-agent-badge dashboard-agent-badge--${log.status}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="dashboard-agent-message">{log.message}</p>
                    <span className="dashboard-agent-time">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight Card */}
            <div className="dashboard-ai-insight">
              <span className="material-symbols-outlined dashboard-ai-insight-icon">auto_awesome</span>
              <p>Architecture drift in <code>payment-svc</code> has increased risk probability by 22%.</p>
            </div>
          </section>
        </div>

        {/* Top Risky Repositories Table */}
        <section className="dashboard-card dashboard-card--table">
          <div className="dashboard-card-header">
            <h3>Top Risky Repositories</h3>
            <button className="dashboard-view-all-btn">View All →</button>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Repository</th>
                  <th>Language</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Open Issues</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {riskyRepos.map((repo) => (
                  <tr key={repo.name}>
                    <td>
                      <div className="dashboard-repo-name">
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>folder</span>
                        {repo.name}
                      </div>
                    </td>
                    <td><span className="dashboard-lang-tag">{repo.lang}</span></td>
                    <td><RiskBadge level={repo.risk} /></td>
                    <td>
                      <div className="dashboard-score-bar">
                        <div
                          className="dashboard-score-bar-fill"
                          style={{
                            width: `${repo.score}%`,
                            background: repo.risk === 'high' ? 'var(--accent-red)' : repo.risk === 'medium' ? 'var(--accent-amber)' : 'var(--accent-green)'
                          }}
                        />
                      </div>
                      <span className="dashboard-score-label">{repo.score}/100</span>
                    </td>
                    <td className="dashboard-issues-count">{repo.issues}</td>
                    <td>
                      <span className={`dashboard-trend dashboard-trend--${repo.trend}`}>
                        {repo.trend === 'up' ? '↑' : repo.trend === 'down' ? '↓' : '→'} {repo.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
