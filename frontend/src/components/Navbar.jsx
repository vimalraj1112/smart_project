import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLink = (to, label) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        onClick={() => setMenuOpen(false)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          active
            ? 'bg-indigo-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {label}
      </Link>
    )
  }

  if (!user) return null

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">SmartTask</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/dashboard', '📊 Dashboard')}
            {navLink('/projects', '📁 Projects')}
            {isAdmin && navLink('/analytics', '📈 Analytics')}
          </div>

          {/* User info + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-slate-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-all border border-red-600/30"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2"
          >
            <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700 bg-slate-900 px-4 py-3 space-y-1">
          {navLink('/dashboard', '📊 Dashboard')}
          {navLink('/projects', '📁 Projects')}
          {isAdmin && navLink('/analytics', '📈 Analytics')}
          <div className="pt-2 border-t border-slate-700 mt-2">
            <p className="text-slate-400 text-xs mb-2">{user.name} ({user.role})</p>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 text-sm">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
