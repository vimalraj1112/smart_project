import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const STATUS_OPTIONS = ['todo', 'in_progress', 'completed']
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
const STATUS_COLORS = { todo: 'bg-slate-600', in_progress: 'bg-amber-600', completed: 'bg-emerald-600' }
const PRIORITY_COLORS = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' }

export default function TaskDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [fileInput, setFileInput] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [taskRes, commentsRes, attachmentsRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/tasks/${id}/comments`),
        api.get(`/tasks/${id}/attachments`),
      ])
      setTask(taskRes.data.task)
      setComments(commentsRes.data.comments)
      setAttachments(attachmentsRes.data.attachments)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus })
      setTask(prev => ({ ...prev, status: newStatus }))
    } catch (e) { console.error(e) }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      const res = await api.post(`/tasks/${id}/comments`, { comment_text: newComment.trim() })
      setComments(prev => [...prev, res.data.comment])
      setNewComment('')
    } catch (e) { console.error(e) }
    finally { setCommentLoading(false) }
  }

  const deleteComment = async (commentId) => {
    await api.delete(`/comments/${commentId}`)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploadLoading(true)
    try {
      const res = await api.post(`/tasks/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAttachments(prev => [res.data.attachment, ...prev])
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploadLoading(false)
      if (fileInput) fileInput.value = ''
    }
  }

  const deleteAttachment = async (attId) => {
    if (!window.confirm('Delete this attachment?')) return
    await api.delete(`/attachments/${attId}`)
    setAttachments(prev => prev.filter(a => a.id !== attId))
  }

  const downloadAttachment = (attId, filename) => {
    const token = localStorage.getItem('token')
    const url = `http://localhost:5000/api/attachments/${attId}/download`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"/></div>
  if (!task) return <div className="p-8 text-red-400">Task not found.</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Link to="/projects" className="text-slate-400 hover:text-white">Projects</Link>
        <span className="text-slate-600">/</span>
        <Link to={`/projects/${task.project_id}`} className="text-slate-400 hover:text-white">{task.project_name}</Link>
        <span className="text-slate-600">/</span>
        <Link to={`/projects/${task.project_id}/board`} className="text-slate-400 hover:text-white">Board</Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300">Task</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task header */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-white mb-2">{task.task_name}</h1>
            {task.description && <p className="text-slate-300 mb-4">{task.description}</p>}
            
            {/* Status change */}
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    task.status === s
                      ? `${STATUS_COLORS[s]} text-white shadow-lg`
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">💬 Comments ({comments.length})</h2>

            <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                {user.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                />
                <button type="submit" disabled={!newComment.trim() || commentLoading}
                  className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg disabled:opacity-50 transition-all">
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {comments.length === 0 && <p className="text-slate-400 text-sm">No comments yet. Be the first!</p>}
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {c.user_name?.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-700/40 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{c.user_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">{new Date(c.timestamp).toLocaleString()}</span>
                        {(c.user_id === user.id || isAdmin) && (
                          <button onClick={() => deleteComment(c.id)} className="text-slate-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all">✕</button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{c.comment_text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task info */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Assigned To</p>
                <p className="text-white text-sm">{task.assigned_user_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Priority</p>
                <p className={`text-sm font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Deadline</p>
                <p className="text-white text-sm">{task.deadline || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Project</p>
                <Link to={`/projects/${task.project_id}`} className="text-indigo-400 hover:text-indigo-300 text-sm">{task.project_name}</Link>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">📎 Attachments ({attachments.length})</h3>

            {/* Upload */}
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-slate-600 hover:border-indigo-500/60 text-slate-400 hover:text-indigo-400 rounded-xl cursor-pointer transition-all text-sm mb-3 ${uploadLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" className="hidden" onChange={handleFileUpload} ref={el => setFileInput(el)} />
              {uploadLoading ? '⏳ Uploading...' : '⬆️ Upload File'}
            </label>

            <div className="space-y-2">
              {attachments.length === 0 && <p className="text-slate-500 text-xs">No attachments yet.</p>}
              {attachments.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-slate-700/40 rounded-lg px-3 py-2 group">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-300 text-xs">📄</span>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-xs font-medium truncate">{a.filename}</p>
                      <p className="text-slate-500 text-xs">{a.uploader_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button onClick={() => downloadAttachment(a.id, a.filename)} className="text-indigo-400 hover:text-indigo-300 text-xs px-1">⬇️</button>
                    {(a.uploaded_by === user.id || isAdmin) && (
                      <button onClick={() => deleteAttachment(a.id)} className="text-slate-500 hover:text-red-400 text-xs px-1 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
