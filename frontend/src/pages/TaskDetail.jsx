import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  ArrowRight, MessageCircle, Paperclip, Upload,
  Trash2, Download, Calendar, User, Folder
} from 'lucide-react'

const STATUS_OPTIONS = ['todo', 'in_progress', 'completed']
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
const STATUS_COLORS = {
  todo: 'bg-white/10 text-white/60',
  in_progress: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-emerald-500/20 text-emerald-300'
}
const PRIORITY_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400'
}

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
        api.get(`/tasks/${id}/attachments`)
      ])
      setTask(taskRes.data.task)
      setComments(commentsRes.data.comments)
      setAttachments(attachmentsRes.data.attachments)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleStatusChange = async (newStatus) => {
    await api.put(`/tasks/${id}`, { status: newStatus })
    setTask(prev => ({ ...prev, status: newStatus }))
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      const res = await api.post(`/tasks/${id}/comments`, {
        comment_text: newComment.trim()
      })
      setComments(prev => [...prev, res.data.comment])
      setNewComment('')
    } finally {
      setCommentLoading(false)
    }
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
    } finally {
      setUploadLoading(false)
      if (fileInput) fileInput.value = ''
    }
  }

  const deleteAttachment = async (attId) => {
    if (!window.confirm('Delete attachment?')) return
    await api.delete(`/attachments/${attId}`)
    setAttachments(prev => prev.filter(a => a.id !== attId))
  }

  const downloadAttachment = (attId, filename) => {
    const url = `http://localhost:5000/api/attachments/${attId}/download`
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!task) return <div className="p-8 text-red-400">Task not found</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
        <Link to="/projects" className="hover:text-white">Projects</Link>
        <ArrowRight size={12} />
        <Link to={`/projects/${task.project_id}`} className="hover:text-white">
          {task.project_name}
        </Link>
        <ArrowRight size={12} />
        <Link to={`/projects/${task.project_id}/board`} className="hover:text-white">
          Board
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
            <h1 className="text-2xl font-bold mb-2">{task.task_name}</h1>

            {task.description && (
              <p className="text-white/50 mb-4">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    task.status === s
                      ? STATUS_COLORS[s]
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* COMMENTS */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">

            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MessageCircle size={16} /> Comments ({comments.length})
            </h2>

            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                {user.name?.charAt(0)}
              </div>

              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm"
                />

                <button
                  type="submit"
                  disabled={!newComment.trim() || commentLoading}
                  className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"
                >
                  {commentLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 group">

                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                    {c.user_name?.charAt(0)}
                  </div>

                  <div className="flex-1 bg-white/[0.03] rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{c.user_name}</span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30">
                          {new Date(c.timestamp).toLocaleString()}
                        </span>

                        {(c.user_id === user.id || isAdmin) && (
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-white/60">{c.comment_text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* DETAILS */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <h3 className="text-sm text-white/40 mb-3 uppercase">Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <User size={14} />
                {task.assigned_user_name || 'Unassigned'}
              </div>

              <div className={`${PRIORITY_COLORS[task.priority]} font-semibold`}>
                Priority: {task.priority?.toUpperCase()}
              </div>

              <div className="flex items-center gap-2 text-white/60">
                <Calendar size={14} />
                {task.deadline || 'No deadline'}
              </div>

              <Link to={`/projects/${task.project_id}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                <Folder size={14} />
                {task.project_name}
              </Link>
            </div>
          </div>

          {/* ATTACHMENTS */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">

            <h3 className="flex items-center gap-2 text-sm text-white/40 mb-3 uppercase">
              <Paperclip size={14} /> Attachments ({attachments.length})
            </h3>

            <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-indigo-500 rounded-xl py-2 cursor-pointer text-sm text-white/40 hover:text-indigo-400 mb-3">
              <Upload size={14} />
              {uploadLoading ? 'Uploading...' : 'Upload File'}
              <input type="file" hidden onChange={handleFileUpload} ref={el => setFileInput(el)} />
            </label>

            <div className="space-y-2">
              {attachments.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-white/[0.03] px-3 py-2 rounded-lg group">

                  <p className="text-xs truncate text-white/60">
                    {a.filename}
                  </p>

                  <div className="flex gap-2">
                    <button onClick={() => downloadAttachment(a.id, a.filename)}>
                      <Download size={12} className="text-indigo-400" />
                    </button>

                    {(a.uploaded_by === user.id || isAdmin) && (
                      <button
                        onClick={() => deleteAttachment(a.id)}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
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