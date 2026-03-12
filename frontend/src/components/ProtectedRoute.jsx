import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding:'3rem', color:'var(--text-muted)' }}>Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div style={{ padding:'3rem', color:'var(--text-muted)' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}
