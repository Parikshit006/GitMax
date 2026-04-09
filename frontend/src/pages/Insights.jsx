import React, { useState } from 'react'
import TopBar from '../components/Layout/TopBar'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import './Insights.css'

const coverageData = [
  { day: 'W1', coverage: 72 },
  { day: 'W2', coverage: 74 },
  { day: 'W3', coverage: 76 },
  { day: 'W4', coverage: 78 },
  { day: 'W5', coverage: 75 },
  { day: 'W6', coverage: 79 },
  { day: 'W7', coverage: 82 },
  { day: 'W8', coverage: 80 },
  { day: 'W9', coverage: 83 },
  { day: 'W10', coverage: 85 },
  { day: 'W11', coverage: 84 },
  { day: 'W12', coverage: 87 },
]

const suiteComposition = [
  { name: 'Unit Tests', value: 54, color: '#3B82F6' },
  { name: 'Integration', value: 24, color: '#8B5CF6' },
  { name: 'E2E', value: 12, color: '#10B981' },
  { name: 'Performance', value: 10, color: '#F59E0B' },
]

const blindSpots = [
  {
    service: 'auth-service',
    severity: 'critical',
    desc: 'Missing unit tests for JWT rotation logic. Security vulnerability risk.',
    coverage: 34,
  },
  {
    service: 'payments-processor',
    severity: 'high',
    desc: 'Integration tests failing in staging. Stripe API mismatch detected.',
    coverage: 48,
  },
  {
    service: 'ui-kit-legacy',
    severity: 'medium',
    desc: 'Regression tests outdated. Component mapping incomplete.',
    coverage: 62,
  },
]

export default function Insights() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="insights-page">
      <TopBar
        tabs={['Overview', 'Insights', 'Repositories']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="insights-content">
        <div className="insights-hero">
          <h1>Quality Insights</h1>
          <p>Continuous integration analysis and code health metrics.</p>
        </div>

        {/* Top Grid: Chart + Metrics */}
        <div className="insights-top-grid">
          <section className="insights-card insights-card--chart">
            <div className="insights-card-header">
              <h3>Coverage Trend</h3>
              <span className="insights-card-sub">Aggregate repository coverage over the last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={coverageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="coverageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--outline)', fontSize: 12 }} domain={[60, 100]} />
                <Tooltip contentStyle={{ background: 'var(--surface-container-lowest)', border: 'none', borderRadius: '8px', boxShadow: '0px 4px 20px rgba(22,28,34,0.08)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="coverage" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#coverageGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          <div className="insights-metrics-col">
            <div className="insights-metric-card">
              <div className="insights-metric-icon">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div className="insights-metric-info">
                <span className="insights-metric-label">Execution Efficiency</span>
                <span className="insights-metric-value">12m 40s</span>
                <span className="insights-metric-change insights-metric-change--down">↓ 14% faster than last week</span>
              </div>
            </div>
            <div className="insights-metric-card">
              <div className="insights-metric-icon insights-metric-icon--green">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="insights-metric-info">
                <span className="insights-metric-label">Test Pass Rate</span>
                <span className="insights-metric-value">99.8%</span>
                <span className="insights-metric-change">Stable performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Blind Spots + Composition + Optimization */}
        <div className="insights-bottom-grid">
          {/* Critical Blind Spots */}
          <section className="insights-card insights-card--blindspots">
            <div className="insights-card-header">
              <h3>Critical Blind Spots</h3>
              <span className="insights-card-sub">Prioritized gaps in your testing infrastructure</span>
            </div>
            <div className="insights-blindspots-list">
              {blindSpots.map((spot, i) => (
                <div key={spot.service} className="insights-blindspot" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="insights-blindspot-left">
                    <div className={`insights-blindspot-severity insights-blindspot-severity--${spot.severity}`} />
                    <div>
                      <h5 className="insights-blindspot-name">{spot.service}</h5>
                      <p className="insights-blindspot-desc">{spot.desc}</p>
                    </div>
                  </div>
                  <div className="insights-blindspot-right">
                    <div className="insights-blindspot-bar">
                      <div
                        className="insights-blindspot-bar-fill"
                        style={{
                          width: `${spot.coverage}%`,
                          background: spot.coverage < 40 ? 'var(--accent-red)' : spot.coverage < 60 ? 'var(--accent-amber)' : 'var(--accent-green)'
                        }}
                      />
                    </div>
                    <span className="insights-blindspot-coverage">{spot.coverage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="insights-right-col">
            {/* Test Suite Composition */}
            <section className="insights-card insights-card--composition">
              <div className="insights-card-header">
                <h3>Test Suite Composition</h3>
              </div>
              <div className="insights-composition-content">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={suiteComposition}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {suiteComposition.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="insights-composition-legend">
                  {suiteComposition.map((item) => (
                    <div key={item.name} className="insights-composition-item">
                      <span className="insights-composition-dot" style={{ background: item.color }} />
                      <span className="insights-composition-name">{item.name}</span>
                      <span className="insights-composition-pct">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Optimization */}
            <div className="insights-card insights-card--optimize">
              <span className="material-symbols-outlined insights-optimize-icon">auto_awesome</span>
              <h4>Automated Optimization</h4>
              <p>Git Max AI suggests merging 12 redundant tests to reduce build time by 3 minutes.</p>
              <button className="insights-optimize-btn">
                Review Suggestions →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
