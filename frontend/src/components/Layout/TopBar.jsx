import React from 'react'
import './TopBar.css'

export default function TopBar({ title, subtitle, tabs, activeTab, onTabChange, actions }) {
  return (
    <header className="topbar glass">
      <div className="topbar-left">
        <div className="topbar-title-group">
          {title && <h1 className="topbar-title">{title}</h1>}
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
        {tabs && tabs.length > 0 && (
          <nav className="topbar-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`topbar-tab ${activeTab === tab ? 'topbar-tab--active' : ''}`}
                onClick={() => onTabChange?.(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <span className="material-symbols-outlined topbar-search-icon">search</span>
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search across platform..."
          />
          <kbd className="topbar-search-kbd">⌘K</kbd>
        </div>
        <button className="topbar-icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="topbar-notif-dot" />
        </button>
        <div className="topbar-avatar">
          <span className="material-symbols-outlined filled">account_circle</span>
        </div>
      </div>
    </header>
  )
}
