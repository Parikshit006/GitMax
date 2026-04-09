import React from 'react'
import './RiskBadge.css'

export default function RiskBadge({ level, label }) {
  const text = label || level
  return (
    <span className={`risk-badge risk-badge--${level?.toLowerCase()}`}>
      {text}
    </span>
  )
}
