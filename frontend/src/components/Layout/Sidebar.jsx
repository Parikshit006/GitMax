import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/repositories', icon: 'inventory_2', label: 'Repositories' },
  { path: '/pull-requests', icon: 'merge_type', label: 'Pull Requests' },
  { path: '/insights', icon: 'insights', label: 'Insights' },
  { path: '/reports', icon: 'analytics', label: 'Reports' },
]

const agentItems = [
  { icon: 'smart_toy', label: 'Repo Agent', status: 'active' },
  { icon: 'security', label: 'Risk Agent', status: 'active' },
  { icon: 'analytics', label: 'Report Agent', status: 'idle' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span className="material-symbols-outlined filled">hub</span>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">Git Max AI</span>
            <span className="sidebar-logo-sub">Risk Intelligence</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">MENU</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
              }
            >
              <span className="material-symbols-outlined sidebar-nav-icon">
                {item.icon}
              </span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.path === '/dashboard' && location.pathname === '/dashboard' && (
                <span className="sidebar-nav-indicator" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Agents */}
        <div className="sidebar-agents">
          <div className="sidebar-section-label">AI AGENTS</div>
          {agentItems.map((agent) => (
            <div key={agent.label} className="sidebar-agent-item">
              <span className="material-symbols-outlined sidebar-nav-icon">
                {agent.icon}
              </span>
              <span className="sidebar-nav-label">{agent.label}</span>
              <span className={`sidebar-agent-status sidebar-agent-status--${agent.status}`} />
            </div>
          ))}
        </div>

        {/* Bottom Links */}
        <div className="sidebar-bottom">
          <a href="#" className="sidebar-nav-item">
            <span className="material-symbols-outlined sidebar-nav-icon">settings</span>
            <span className="sidebar-nav-label">Settings</span>
          </a>
          <a href="#" className="sidebar-nav-item">
            <span className="material-symbols-outlined sidebar-nav-icon">help_outline</span>
            <span className="sidebar-nav-label">Support</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
