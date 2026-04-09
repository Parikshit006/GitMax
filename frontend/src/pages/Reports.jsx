import React, { useState } from 'react'
import TopBar from '../components/Layout/TopBar'
import RiskBadge from '../components/ui/RiskBadge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import './Reports.css'

const riskDistribution = [
  { name: 'Auth', value: 87, color: '#EF4444' },
  { name: 'Payments', value: 72, color: '#F59E0B' },
  { name: 'API', value: 45, color: '#3B82F6' },
  { name: 'Frontend', value: 28, color: '#8B5CF6' },
  { name: 'Infra', value: 15, color: '#10B981' },
]

const strategicRisks = [
  {
    title: 'Authentication Bypass Vulnerability',
    severity: 'critical',
    desc: 'A logical flaw in the OAuth2 implementation could allow unauthorized access to administrative endpoints under specific conditions.',
    impact: 'Potential exposure of PII for 4.2M users; estimated regulatory penalty risk of $12.4M.',
    icon: 'shield',
  },
  {
    title: 'Technical Debt in Payment Gateway',
    severity: 'high',
    desc: 'Aging infrastructure in the legacy payment processing module is causing intermittent timeout issues for APAC regions.',
    impact: 'Abandonment rate at checkout increased by 3.2% month-over-month; projected $450k monthly revenue loss.',
    icon: 'payments',
  },
  {
    title: 'Developer Burnout Index',
    severity: 'medium',
    desc: 'Workload intensity in the Infrastructure team has exceeded sustainable levels for 3 consecutive sprints.',
    impact: 'Increased risk of knowledge loss through attrition; estimated 14% delay in Q4 cloud migration roadmap.',
    icon: 'group',
  },
]

const actions = [
  {
    title: 'Patch Auth Service v2.4',
    desc: 'Immediately deploy the security patch to the gateway service to eliminate the PII exposure risk.',
    priority: 'P0',
    icon: 'security_update_good',
  },
  {
    title: 'Scale Checkout Microservices',
    desc: 'Allocate 2 senior engineers to the APAC payment gateway refactor to reduce timeout errors.',
    priority: 'P1',
    icon: 'dns',
  },
  {
    title: 'Review Infrastructure Load',
    desc: 'Onboard 2 additional SRE contractors to alleviate current workload and prevent burnout attrition.',
    priority: 'P1',
    icon: 'engineering',
  },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <div className="reports-page">
      <TopBar
        tabs={['Dashboard', 'Repositories', 'Reports']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="reports-content">
        {/* Report Header */}
        <div className="reports-header">
          <div className="reports-header-badge">
            <span className="material-symbols-outlined">auto_stories</span>
            The Precision Editorial
          </div>
          <h1>Executive Risk Report</h1>
          <p>Q3 Engineering Performance & Security Posture — Oct 2023</p>
        </div>

        {/* Health Score Row */}
        <div className="reports-health-row">
          <div className="reports-health-card">
            <span className="reports-health-label">System Health Score</span>
            <div className="reports-health-gauge">
              <svg viewBox="0 0 140 80" width="140" height="80">
                <path
                  d="M 10 70 A 60 60 0 0 1 130 70"
                  fill="none"
                  stroke="var(--surface-container)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 70 A 60 60 0 0 1 130 70"
                  fill="none"
                  stroke="url(#healthGaugeGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={Math.PI * 60}
                  strokeDashoffset={Math.PI * 60 * (1 - 0.84)}
                  style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                />
                <defs>
                  <linearGradient id="healthGaugeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="reports-health-value">84%</span>
            </div>
            <RiskBadge level="stable" label="Stable" />
          </div>

          <div className="reports-risk-metric">
            <div className="reports-risk-metric-top">
              <h4>Risk of Downtime</h4>
              <span className="reports-risk-pct">1.2%</span>
            </div>
            <p>↓ 0.4% from previous quarter. System stability remains within Tier 1 SLA thresholds.</p>
          </div>

          <div className="reports-risk-metric">
            <div className="reports-risk-metric-top">
              <h4>Critical Bug Probability</h4>
              <span className="reports-risk-pct reports-risk-pct--warn">24%</span>
            </div>
            <p>↑ 8% increase due to legacy module refactoring in the Core API.</p>
          </div>
        </div>

        {/* Strategic Risks */}
        <section className="reports-card">
          <div className="reports-card-header">
            <h3>Top Strategic Risks</h3>
          </div>
          <div className="reports-risks-list">
            {strategicRisks.map((risk, i) => (
              <div key={risk.title} className="reports-risk-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`reports-risk-icon reports-risk-icon--${risk.severity}`}>
                  <span className="material-symbols-outlined">{risk.icon}</span>
                </div>
                <div className="reports-risk-info">
                  <div className="reports-risk-top">
                    <h4>{risk.title}</h4>
                    <RiskBadge level={risk.severity === 'critical' ? 'high' : risk.severity} label={risk.severity} />
                  </div>
                  <p className="reports-risk-desc">{risk.desc}</p>
                  <div className="reports-risk-impact">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
                    <strong>Business Impact:</strong> {risk.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="reports-bottom-grid">
          {/* Recommended Actions */}
          <section className="reports-card">
            <div className="reports-card-header">
              <h3>Recommended Actions</h3>
            </div>
            <div className="reports-actions-list">
              {actions.map((action, i) => (
                <div key={action.title} className="reports-action-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="reports-action-icon">
                    <span className="material-symbols-outlined">{action.icon}</span>
                  </div>
                  <div className="reports-action-info">
                    <div className="reports-action-top">
                      <h5>{action.title}</h5>
                      <span className={`reports-action-priority reports-action-priority--${action.priority.toLowerCase()}`}>
                        {action.priority}
                      </span>
                    </div>
                    <p>{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Distribution */}
          <section className="reports-card reports-card--distribution">
            <div className="reports-card-header">
              <h3>Risk Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={riskDistribution} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--surface-container-lowest)', border: 'none', borderRadius: '8px', boxShadow: '0px 4px 20px rgba(22,28,34,0.08)', fontSize: '13px' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* AI Forecaster */}
        <div className="reports-forecaster">
          <span className="material-symbols-outlined reports-forecaster-icon">auto_awesome</span>
          <div>
            <h4>AI Forecaster</h4>
            <p>Predicting <strong>15% system reliability increase</strong> if all P0 actions are completed by end of month.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
