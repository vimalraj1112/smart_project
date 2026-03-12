import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const NEXT_STATUS = { todo: 'in_progress', in_progress: 'completed', completed: null }
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
const StatusBadge = ({ status }) => {
  const map = { todo:'badge-todo', in_progress:'badge-in_progress', completed:'badge-completed' }
  return <span className={`badge ${map[status]||'badge-todo'}`}>{STATUS_LABEL[status]||status}</span>
}

function AddTaskModal({ projectId, users, onClose, onSaved }) {
  const [form, setForm] = useState({ task_name:'', description:'', assigned_user_id:'', priority:'medium', deadline:'' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/tasks/', { ...form, project_id: projectId, assigned_user_id: form.assigned_user_id||null })
      onSaved()
    } catch(e) { alert(e.response?.data?.error||'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'1.25rem' }}>New Task</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom:'1rem' }}>
            <label className="label">Task Name *</label>
            <input className="input" required value={form.task_name} onChange={e=>setForm(p=>({...p,task_name:e.target.value}))} />
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <label className="label">Description</label>
            <textarea className="input" rows={2} style={{ resize:'none' }} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div>
              <label className="label">Assign To</label>
              <select className="input" value={form.assigned_user_id} onChange={e=>setForm(p=>({...p,assigned_user_id:e.target.value}))}>
                <option value="">Unassigned</option>
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
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Creating…':'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [addMemberUser, setAddMemberUser] = useState('')
  const [taskFilter, setTaskFilter] = useState('')

  const fetchAll = async () => {
    try {
      const [pr, tr, ur] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/?project_id=${id}`),
        api.get('/auth/users'),
      ])
      setProject(pr.data.project); setTasks(tr.data.tasks); setUsers(ur.data.users)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ fetchAll() },[id])

  const handleAddMember = async () => {
    if (!addMemberUser) return
    await api.post(`/projects/${id}/members`, { user_id: parseInt(addMemberUser) })
    setAddMemberUser(''); fetchAll()
  }

  const handleRemoveMember = async (uid) => {
    await api.delete(`/projects/${id}/members/${uid}`); fetchAll()
  }

  const handleStatusChange = async (tid, status) => {
    await api.put(`/tasks/${tid}`, { status })
    setTasks(p => p.map(t => t.id===tid ? {...t, status} : t))
  }

  if (loading) return <div style={{ padding:'3rem', color:'var(--text-muted)' }}>Loading…</div>
  if (!project) return <div style={{ padding:'3rem', color:'#dc2626' }}>Project not found.</div>

  const memberIds = new Set(project.members?.map(m=>m.id)||[])
  const available = users.filter(u=>!memberIds.has(u.id))
  const filteredTasks = taskFilter ? tasks.filter(t=>t.status===taskFilter) : tasks

  const todo = tasks.filter(t=>t.status==='todo').length
  const inProg = tasks.filter(t=>t.status==='in_progress').length
  const done = tasks.filter(t=>t.status==='completed').length
  const pct = tasks.length>0 ? Math.round(done/tasks.length*100) : 0

  return (
    <div className="page-body">
      {/* Breadcrumb */}
      <div style={{ marginBottom:'0.75rem', fontSize:'0.8125rem', color:'var(--text-muted)', display:'flex', gap:'0.5rem' }}>
        <Link to="/projects" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Projects</Link>
        <span>/</span>
        <span style={{ color:'var(--text-primary)' }}>{project.project_name}</span>
      </div>

      {/* Project header */}
      <div className="card" style={{ padding:'1.25rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
          <div>
            <h1 style={{ fontSize:'1.125rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'0.25rem' }}>{project.project_name}</h1>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-secondary)' }}>{project.description || 'No description.'}</p>
            {project.deadline && <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>📅 Deadline: {project.deadline}</p>}
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <p style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text-primary)' }}>{pct}%</p>
            <p style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>complete</p>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop:'1rem', height:5, background:'var(--bg-muted)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#111827', borderRadius:3, transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex', gap:'1.5rem', marginTop:'0.5rem' }}>
          {[['To Do',todo,'var(--text-muted)'],['In Progress',inProg,'#d97706'],['Done',done,'#059669']].map(([l,v,c])=>(
            <span key={l} style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>
              <span style={{ color:c, fontWeight:600 }}>{v}</span> {l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.25rem', alignItems:'start' }}>
        {/* Tasks */}
        <div>
          <div className="card">
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>Tasks ({tasks.length})</h2>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                <select className="input" style={{ width:140, fontSize:'0.75rem' }} value={taskFilter} onChange={e=>setTaskFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                {isAdmin && <button className="btn btn-primary" style={{ fontSize:'0.75rem' }} onClick={()=>setShowTaskModal(true)}>+ Add Task</button>}
              </div>
            </div>
            <table className="table">
              <thead>
                <tr><th>Task</th><th>Assigned</th><th>Priority</th><th>Status</th><th>Deadline</th></tr>
              </thead>
              <tbody>
                {filteredTasks.length===0
                  ? <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>No tasks.</td></tr>
                  : filteredTasks.map(t=>(
                    <tr key={t.id}>
                      <td><Link to={`/tasks/${t.id}`} style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>{t.task_name}</Link></td>
                      <td style={{ color:'var(--text-secondary)' }}>{t.assigned_user_name||'—'}</td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td>
                        {isAdmin ? (
                          // 1. Admin -> Read-only badge
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
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Members */}
        <div className="card" style={{ padding:'1.25rem' }}>
          <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'1rem' }}>Members ({project.members?.length||0})</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:'1rem' }}>
            {(project.members||[]).map(m=>(
              <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.625rem', background:'var(--bg-muted)', borderRadius:7 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600 }}>
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:'0.8125rem', fontWeight:500 }}>{m.name}</p>
                    <p style={{ fontSize:'0.6875rem', color:'var(--text-muted)', textTransform:'capitalize' }}>{m.role}</p>
                  </div>
                </div>
                {isAdmin && (
                  <button className="btn btn-ghost" style={{ fontSize:'0.75rem', padding:'0.2rem 0.4rem', color:'var(--text-muted)' }}
                    onClick={()=>handleRemoveMember(m.id)}>×</button>
                )}
              </div>
            ))}
          </div>

          {isAdmin && available.length > 0 && (
            <div>
              <label className="label">Add member</label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <select className="input" value={addMemberUser} onChange={e=>setAddMemberUser(e.target.value)}>
                  <option value="">— Select —</option>
                  {available.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button className="btn btn-secondary" style={{ flexShrink:0 }} onClick={handleAddMember}>Add</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTaskModal && (
        <AddTaskModal projectId={parseInt(id)} users={users} onClose={()=>setShowTaskModal(false)} onSaved={()=>{ setShowTaskModal(false); fetchAll() }} />
      )}
    </div>
  )
}
