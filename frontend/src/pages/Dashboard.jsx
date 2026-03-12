import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StatCard = ({ label, value, sub }) => (
  <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
  </div>
)

const StatusBadge = ({ status }) => {
  const map = { todo: 'badge-todo', in_progress: 'badge-in_progress', completed: 'badge-completed' }
  const label = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
  return <span className={`badge ${map[status] || 'badge-todo'}`}>{label[status] || status}</span>
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</div>
  if (!data) return <div style={{ padding: '3rem', color: '#dc2626' }}>Failed to load dashboard.</div>

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">Good day, {user.name}</h1>
        <p className="page-subtitle">Here's what's happening across your workspace.</p>
      </div>

      {isAdmin ? (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard label="Projects" value={data.total_projects} />
            <StatCard label="Total Tasks" value={data.total_tasks} />
            <StatCard label="Completed" value={data.completed_tasks} sub={`${data.total_tasks ? Math.round(data.completed_tasks/data.total_tasks*100) : 0}% done`} />
            <StatCard label="In Progress" value={data.in_progress_tasks} />
            <StatCard label="To Do" value={data.todo_tasks} />
            <StatCard label="Team Members" value={data.total_users} />
          </div>

          {/* Project summary table */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Project Summary</h2>
              <Link to="/projects" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
            </div>
            <table className="table">
              <thead>
                <tr><th>Project</th><th>Total</th><th>Completed</th><th>In Progress</th><th>To Do</th></tr>
              </thead>
              <tbody>
                {data.tasks_per_project.length === 0
                  ? <tr><td colSpan={5} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No projects yet.</td></tr>
                  : data.tasks_per_project.map((p, i) => {
                      const pct = p.total > 0 ? Math.round(p.completed/p.total*100) : 0
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{p.project_name}</td>
                          <td>{p.total}</td>
                          <td><span className="badge badge-completed">{p.completed}</span></td>
                          <td><span className="badge badge-in_progress">{p.in_progress}</span></td>
                          <td><span className="badge badge-todo">{p.todo}</span></td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* User stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard label="My Projects" value={data.my_projects} />
            <StatCard label="My Tasks" value={data.my_tasks} />
            <StatCard label="Completed" value={data.completed} />
            <StatCard label="In Progress" value={data.in_progress} />
          </div>

          {/* Recent tasks */}
          <div className="card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Tasks</h2>
              <Link to="/tasks" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
            </div>
            <table className="table">
              <thead>
                <tr><th>Task</th><th>Project</th><th>Status</th><th>Deadline</th></tr>
              </thead>
              <tbody>
                {data.recent_tasks.length === 0
                  ? <tr><td colSpan={4} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No tasks assigned yet.</td></tr>
                  : data.recent_tasks.map(t => (
                      <tr key={t.id}>
                        <td><Link to={`/tasks/${t.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{t.task_name}</Link></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.project_name}</td>
                        <td><StatusBadge status={t.status} /></td>
                        <td style={{ color: 'var(--text-muted)' }}>{t.deadline || '—'}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
