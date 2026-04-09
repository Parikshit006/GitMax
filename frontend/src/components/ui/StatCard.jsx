import React from 'react'
import './StatCard.css'

export default function StatCard({ icon, label, value, change, changeType, color = 'primary' }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon stat-card-icon--${color}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {change && (
          <span className={`stat-card-change stat-card-change--${changeType || 'neutral'}`}>
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
