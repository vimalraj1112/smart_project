import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  BarChart3,
  LogOut
} from 'lucide-react'

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItem = (to, label, Icon) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? 'bg-indigo-600/20 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
            : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
        }`
      }
    >
      <Icon
        size={16}
        className="opacity-70 group-hover:opacity-100 transition"
      />
      {label}
    </NavLink>
  )

  if (!user) return null

  return (
    <aside className="w-[230px] min-w-[230px] h-screen sticky top-0 flex flex-col bg-[#0a0a0f] border-r border-white/[0.06]">

      {/* Top glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <CheckSquare size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-[15px] tracking-[-0.01em]">
            SmartTask
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 relative z-10">

        <p className="text-white/30 text-[10px] uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>

        {navItem('/dashboard', 'Dashboard', LayoutDashboard)}
        {navItem('/projects', 'Projects', Folder)}
        {navItem('/tasks', 'My Tasks', CheckSquare)}

        {isAdmin && (
          <>
            <p className="text-white/30 text-[10px] uppercase tracking-wider px-2 mt-4 mb-2">
              Admin
            </p>
            {navItem('/analytics', 'Analytics', BarChart3)}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/[0.06] relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-white text-[13px] font-medium truncate">
              {user.name}
            </p>
            <p className="text-white/40 text-[11px] capitalize">
              {user.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white text-[12px] border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] hover:bg-white/[0.06] rounded-lg py-2 transition"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}