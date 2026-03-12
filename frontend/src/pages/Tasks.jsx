import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StatusBadge = ({ status }) => {
  const map = { todo:'badge-todo', in_progress:'badge-in_progress', completed:'badge-completed' }
  const label = { todo:'To Do', in_progress:'In Progress', completed:'Completed' }
  return <span className={`badge ${map[status]||'badge-todo'}`}>{label[status]||status}</span>
}

const PriBadge = ({ p }) => {
  const map = { low:'badge-low', medium:'badge-medium', high:'badge-high' }
  return <span className={`badge ${map[p]||'badge-medium'}`}>{p?.charAt(0).toUpperCase()+p?.slice(1)}</span>
}

function TaskModal({ projectId, users, projects, onClose, onSaved }) {
  const [form, setForm] = useState({ task_name:'', description:'', project_id: projectId||'', assigned_user_id:'', priority:'medium', deadline:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.post('/tasks/', { ...form, project_id: parseInt(form.project_id), assigned_user_id: form.assigned_user_id||null })
      onSaved()
    } catch(err) { setError(err.response?.data?.error||'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'1.25rem' }}>New Task</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom:'1rem' }}>
            <label className="label">Task Name *</label>
            <input className="input" required value={form.task_name} onChange={e=>setForm(p=>({...p,task_name:e.target.value}))} />
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <label className="label">Description</label>
            <textarea className="input" rows={2} style={{ resize:'none' }} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
          </div>
          {!projectId && (
            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Project *</label>
              <select className="input" required value={form.project_id} onChange={e=>setForm(p=>({...p,project_id:e.target.value}))}>
                <option value="">— Select —</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div>
              <label className="label">Assign To</label>
              <select className="input" value={form.assigned_user_id} onChange={e=>setForm(p=>({...p,assigned_user_id:e.target.value}))}>
                <option value="">— Unassigned —</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:'1.5rem' }}>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} />
          </div>
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Creating…':'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// For users: only allow moving forward, never backward
const NEXT_STATUS = { todo: 'in_progress', in_progress: 'completed', completed: null }
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }

export default function Tasks() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState({ status:'', project_id:'' })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.project_id) params.set('project_id', filter.project_id)
      const [tr, pr, ur] = await Promise.all([
        api.get(`/tasks/?${params}`),
        api.get('/projects/'),
        api.get('/auth/users'),
      ])
      let t = tr.data.tasks
      if (filter.status) t = t.filter(x => x.status === filter.status)
      setTasks(t); setProjects(pr.data.projects); setUsers(ur.data.users)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [filter])

  useEffect(()=>{ fetchAll() },[fetchAll])

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}`, { status: newStatus })
    setTasks(prev => prev.map(t => t.id===taskId ? {...t, status:newStatus} : t))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete task?')) return
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t=>t.id!==id))
  }

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length!==1?'s':''}</p>
        </div>
        <div style={{ display:'flex', gap:'0.625rem', alignItems:'center' }}>
          <select className="input" style={{ width:150 }} value={filter.status} onChange={e=>setFilter(p=>({...p,status:e.target.value}))}>
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input" style={{ width:160 }} value={filter.project_id} onChange={e=>setFilter(p=>({...p,project_id:e.target.value}))}>
            <option value="">All projects</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
          </select>
          {isAdmin && (
            <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ New Task</button>
          )}
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Task</th><th>Project</th><th>Assigned To</th>
              <th>Priority</th><th>Status</th><th>Deadline</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2.5rem' }}>Loading…</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2.5rem' }}>No tasks found.</td></tr>
            ) : tasks.map(t => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tasks/${t.id}`} style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>{t.task_name}</Link>
                  {(t.comment_count > 0 || t.attachment_count > 0) && (
                    <span style={{ marginLeft:6, fontSize:'0.6875rem', color:'var(--text-muted)' }}>
                      {t.comment_count>0 && `💬${t.comment_count} `}{t.attachment_count>0 && `📎${t.attachment_count}`}
                    </span>
                  )}
                </td>
                <td style={{ color:'var(--text-secondary)' }}>{t.project_name}</td>
                <td style={{ color:'var(--text-secondary)' }}>{t.assigned_user_name||'—'}</td>
                <td><PriBadge p={t.priority} /></td>
                <td>
                  {isAdmin ? (
                    // 1. Admin -> Always read-only badge
                    <StatusBadge status={t.status} />
                  ) : t.assigned_user_id === user?.id ? (
                    // 2. User assigned to this task -> Forward button
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <StatusBadge status={t.status} />
                      {NEXT_STATUS[t.status] && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding:'0.2rem 0.55rem', fontSize:'0.7rem' }}
                          onClick={()=>handleStatusChange(t.id, NEXT_STATUS[t.status])}
                          title={`Move to ${STATUS_LABEL[NEXT_STATUS[t.status]]}`}
                        >
                          → {STATUS_LABEL[NEXT_STATUS[t.status]]}
                        </button>
                      )}
                    </div>
                  ) : (
                    // 3. User NOT assigned to this task -> Read-only badge
                    <StatusBadge status={t.status} />
                  )}
                </td>
                <td style={{ color:'var(--text-muted)' }}>{t.deadline||'—'}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-danger" style={{ padding:'0.25rem 0.6rem', fontSize:'0.75rem' }}
                      onClick={()=>handleDelete(t.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TaskModal projects={projects} users={users} onClose={()=>setShowModal(false)} onSaved={()=>{ setShowModal(false); fetchAll() }} />
      )}
    </div>
  )
}
