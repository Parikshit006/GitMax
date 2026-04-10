import React from 'react'
import './RiskScoreRing.css'

export default function RiskScoreRing({ score, size = 56, label }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return 'var(--accent-green)'
    if (s >= 50) return 'var(--accent-amber)'
    return 'var(--accent-red)'
  }

  return (
    <div className="risk-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-container)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="risk-score-ring-progress"
        />
      </svg>
      <div className="risk-score-ring-value" style={{ color: getColor(score) }}>
        {score}
      </div>
    </div>
  )
}
