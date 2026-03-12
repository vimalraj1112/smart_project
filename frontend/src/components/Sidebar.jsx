import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ICON = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  projects: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  tasks: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navItem = (to, label, icon) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
          isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <span className="flex-shrink-0 opacity-70">{icon}</span>
      {label}
    </NavLink>
  )

  if (!user) return null

  return (
    <aside style={{
      width: '220px', minWidth: '220px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      overflow: 'hidden',
    }}>
      {/* Logo / Brand */}
      <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 28, height: 28,
            background: '#111827', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>ST</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            SmartTask
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '0.75rem 0.625rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: '0.6375rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.375rem', marginBottom: '0.25rem' }}>
          Navigation
        </p>
        {navItem('/dashboard', 'Dashboard', NAV_ICON.dashboard)}
        {navItem('/projects', 'Projects', NAV_ICON.projects)}
        {navItem('/tasks', 'My Tasks', NAV_ICON.tasks)}
        {isAdmin && (
          <>
            <p style={{ fontSize: '0.6375rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.75rem 0.375rem 0.25rem' }}>
              Admin
            </p>
            {navItem('/analytics', 'Analytics', NAV_ICON.analytics)}
          </>
        )}
      </nav>

      {/* User profile + logout */}
      <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 mb-2.5">
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#e5e7eb', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#374151', flexShrink: 0,
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '0.4rem 0.75rem',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-secondary)',
            cursor: 'pointer', textAlign: 'left',
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.target.style.background='var(--bg-muted)'}
          onMouseLeave={e => e.target.style.background='transparent'}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
