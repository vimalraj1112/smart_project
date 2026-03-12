import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const StatusBadge = ({ status }) => {
  const map = { todo: 'badge-todo', in_progress: 'badge-in_progress', completed: 'badge-completed' }
  const label = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
  return <span className={`badge ${map[status]||'badge-todo'}`}>{label[status]||status}</span>
}

function ProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ project_name: project?.project_name||'', description: project?.description||'', deadline: project?.deadline||'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (project) await api.put(`/projects/${project.id}`, form)
      else await api.post('/projects/', form)
      onSaved()
    } catch(err) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          {project ? 'Edit Project' : 'New Project'}
        </h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Project Name *</label>
            <input className="input" required value={form.project_name} onChange={e=>setForm(p=>({...p,project_name:e.target.value}))} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Description</label>
            <textarea className="input" rows={3} style={{ resize: 'none' }} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving…':'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MemberModal({ project, onClose, onSaved }) {
  const [users, setUsers] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/auth/users').then(r=>setUsers(r.data.users)) }, [])

  const handleAdd = async () => {
    if (!selectedId) return
    setLoading(true)
    try { await api.post(`/projects/${project.id}/members`, { user_id: parseInt(selectedId) }); onSaved() }
    catch(e) { alert(e.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const memberIds = new Set(project.members?.map(m => m.id) || [])
  const available = users.filter(u => !memberIds.has(u.id))

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add Member</h2>
        <label className="label">Select user</label>
        <select className="input" style={{ marginBottom: '1.5rem' }} value={selectedId} onChange={e=>setSelectedId(e.target.value)}>
          <option value="">— Choose —</option>
          {available.map(u=><option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
        </select>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!selectedId||loading} onClick={handleAdd}>{loading?'Adding…':'Add Member'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [memberProject, setMemberProject] = useState(null)
  const [search, setSearch] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/projects/'); setProjects(r.data.projects) }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [])
  useEffect(()=>{ fetch() },[fetch])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    await api.delete(`/projects/${id}`); fetch()
  }

  const filtered = projects.filter(p=>p.project_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length!==1?'s':''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            className="input" style={{ width: 220 }}
            placeholder="Search projects…"
            value={search} onChange={e=>setSearch(e.target.value)}
          />
          {isAdmin && (
            <button className="btn btn-primary" onClick={()=>{ setEditProject(null); setShowModal(true) }}>
              + New Project
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Members</th>
              <th>Tasks</th>
              <th>Deadline</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2.5rem' }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2.5rem' }}>
                {search ? 'No projects match your search.' : 'No projects yet.'}
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <Link to={`/projects/${p.id}`} style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>
                    {p.project_name}
                  </Link>
                </td>
                <td style={{ color:'var(--text-secondary)', maxWidth:240 }}>
                  <span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.description || '—'}
                  </span>
                </td>
                <td style={{ color:'var(--text-secondary)' }}>{p.member_count}</td>
                <td style={{ color:'var(--text-secondary)' }}>{p.task_count}</td>
                <td style={{ color:'var(--text-muted)' }}>{p.deadline || '—'}</td>
                {isAdmin && (
                  <td>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <button className="btn btn-ghost" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                        onClick={()=>{ setEditProject(p); setShowModal(true) }}>Edit</button>
                      <button className="btn btn-ghost" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                        onClick={()=>setMemberProject(p)}>Members</button>
                      <button className="btn btn-danger" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}
                        onClick={()=>handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <ProjectModal project={editProject} onClose={()=>setShowModal(false)} onSaved={()=>{ setShowModal(false); fetch() }} />}
      {memberProject && <MemberModal project={memberProject} onClose={()=>setMemberProject(null)} onSaved={()=>{ setMemberProject(null); fetch() }} />}
    </div>
  )
}
