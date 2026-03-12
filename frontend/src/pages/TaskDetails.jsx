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

export default function TaskDetails() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchAll = async () => {
    try {
      const [tr, cr, ar] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/tasks/${id}/comments`),
        api.get(`/tasks/${id}/attachments`),
      ])
      setTask(tr.data.task); setComments(cr.data.comments); setAttachments(ar.data.attachments)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleStatusChange = async (status) => {
    await api.put(`/tasks/${id}`, { status })
    setTask(p => ({ ...p, status }))
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    try {
      const r = await api.post(`/tasks/${id}/comments`, { comment_text: commentText })
      setComments(p => [...p, r.data.comment]); setCommentText('')
    } catch(e) { console.error(e) }
    finally { setPosting(false) }
  }

  const deleteComment = async (cid) => {
    await api.delete(`/comments/${cid}`)
    setComments(p => p.filter(c => c.id !== cid))
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('file', file)
    setUploading(true)
    try {
      const r = await api.post(`/tasks/${id}/attachments`, fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      setAttachments(p => [...p, r.data.attachment])
    } catch(err) { alert(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false); e.target.value='' }
  }

  const deleteAttachment = async (aid) => {
    await api.delete(`/attachments/${aid}`)
    setAttachments(p => p.filter(a => a.id !== aid))
  }

  if (loading) return <div style={{ padding:'3rem', color:'var(--text-muted)' }}>Loading…</div>
  if (!task) return <div style={{ padding:'3rem', color:'#dc2626' }}>Task not found.</div>

  return (
    <div className="page-body">
      {/* Breadcrumb */}
      <div style={{ marginBottom:'1rem', fontSize:'0.8125rem', color:'var(--text-muted)', display:'flex', gap:'0.5rem', alignItems:'center' }}>
        <Link to="/projects" style={{ color:'var(--text-muted)', textDecoration:'none' }}>Projects</Link>
        <span>/</span>
        <Link to={`/projects/${task.project_id}`} style={{ color:'var(--text-muted)', textDecoration:'none' }}>{task.project_name}</Link>
        <span>/</span>
        <span style={{ color:'var(--text-primary)' }}>{task.task_name}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem', alignItems:'start' }}>
        {/* Task info */}
        <div>
          <div className="card" style={{ padding:'1.5rem', marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem', gap:'1rem' }}>
              {isAdmin ? (
                // 1. Admin -> Always read-only badge
                <StatusBadge status={task.status} />
              ) : task.assigned_user_id === user?.id ? (
                // 2. User assigned to this task -> Forward button
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <StatusBadge status={task.status} />
                  {NEXT_STATUS[task.status] && (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize:'0.75rem', padding:'0.3rem 0.6rem' }}
                      onClick={()=>handleStatusChange(NEXT_STATUS[task.status])}
                    >
                      → {STATUS_LABEL[NEXT_STATUS[task.status]]}
                    </button>
                  )}
                </div>
              ) : (
                // 3. Others -> Just Badge
                <StatusBadge status={task.status} />
              )}
            </div>

            <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'1.25rem', whiteSpace:'pre-wrap' }}>
              {task.description || <span style={{ color:'var(--text-muted)', fontStyle:'italic' }}>No description.</span>}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {[
                ['Project', <Link to={`/projects/${task.project_id}`} style={{ color:'var(--accent)', textDecoration:'none' }}>{task.project_name}</Link>],
                ['Assigned to', task.assigned_user_name || '—'],
                ['Priority', <span className={`badge badge-${task.priority}`}>{task.priority}</span>],
                ['Status', <StatusBadge status={task.status} />],
                ['Deadline', task.deadline || '—'],
                ['Created', task.created_at?.slice(0,10)],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background:'var(--bg-muted)', borderRadius:7, padding:'0.75rem' }}>
                  <p style={{ fontSize:'0.6875rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'0.25rem', fontWeight:500 }}>{lbl}</p>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-primary)' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="card" style={{ padding:'1.25rem' }}>
            <h2 style={{ fontSize:'0.875rem', fontWeight:600, marginBottom:'1rem', color:'var(--text-primary)' }}>
              Comments ({comments.length})
            </h2>

            <div style={{ marginBottom:'1rem' }}>
              {comments.length === 0
                ? <p style={{ color:'var(--text-muted)', fontSize:'0.8125rem' }}>No comments yet.</p>
                : comments.map(c => (
                  <div key={c.id} style={{ padding:'0.75rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.75rem' }}>
                    <div>
                      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.25rem' }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, flexShrink:0 }}>
                          {c.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize:'0.8125rem', fontWeight:500, color:'var(--text-primary)' }}>{c.user_name}</span>
                        <span style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>{c.timestamp?.slice(0,16).replace('T',' ')}</span>
                      </div>
                      <p style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', paddingLeft:32 }}>{c.comment_text}</p>
                    </div>
                    {(c.user_id === user.id || isAdmin) && (
                      <button className="btn btn-ghost" style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', color:'var(--text-muted)', flexShrink:0 }}
                        onClick={()=>deleteComment(c.id)}>×</button>
                    )}
                  </div>
                ))
              }
            </div>

            <form onSubmit={postComment} style={{ display:'flex', gap:'0.5rem' }}>
              <input
                className="input"
                placeholder="Add a comment…"
                value={commentText}
                onChange={e=>setCommentText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={posting || !commentText.trim()} style={{ flexShrink:0 }}>
                {posting ? '…' : 'Post'}
              </button>
            </form>
          </div>
        </div>

        {/* Attachments */}
        <div className="card" style={{ padding:'1.25rem' }}>
          <h2 style={{ fontSize:'0.875rem', fontWeight:600, marginBottom:'1rem', color:'var(--text-primary)' }}>
            Attachments ({attachments.length})
          </h2>

          <label style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            border:'1.5px dashed var(--border-dark)', borderRadius:8, padding:'1rem',
            cursor:'pointer', marginBottom:'1rem', background:'var(--bg-muted)',
            fontSize:'0.8125rem', color:'var(--text-secondary)',
          }}>
            <span>📎 {uploading ? 'Uploading…' : 'Click to upload'}</span>
            <span style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>PDF, images, docs, ZIP (max 16 MB)</span>
            <input type="file" style={{ display:'none' }} onChange={uploadFile} disabled={uploading} />
          </label>

          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {attachments.length === 0
              ? <p style={{ color:'var(--text-muted)', fontSize:'0.8125rem' }}>No files uploaded.</p>
              : attachments.map(a => (
                <div key={a.id} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'0.5rem 0.75rem', background:'var(--bg-muted)', borderRadius:7,
                  border:'1px solid var(--border)',
                }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:'0.8125rem', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.filename}</p>
                    <p style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>{a.uploader_name}</p>
                  </div>
                  <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                    <a href={`http://localhost:5000/api/attachments/${a.id}/download`}
                      target="_blank" rel="noreferrer"
                      style={{ fontSize:'0.75rem' }}
                      className="btn btn-secondary"
                    >↓</a>
                    {(a.uploaded_by === user.id || isAdmin) && (
                      <button className="btn btn-danger" style={{ fontSize:'0.75rem', padding:'0.25rem 0.5rem' }}
                        onClick={()=>deleteAttachment(a.id)}>×</button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
