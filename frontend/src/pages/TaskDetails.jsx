import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  ArrowRight, MessageCircle, Paperclip,
  Upload, Trash2, Download, Calendar,
  User, Folder, ChevronRight
} from 'lucide-react'

const NEXT_STATUS = { todo: 'in_progress', in_progress: 'completed', completed: null }
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }

const STATUS_STYLES = {
  todo: 'bg-white/10 text-white/60',
  in_progress: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-emerald-500/20 text-emerald-300'
}

const PRIORITY_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400'
}

const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 text-xs rounded-lg ${STATUS_STYLES[status]}`}>
    {STATUS_LABEL[status]}
  </span>
)

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
        api.get(`/tasks/${id}/attachments`)
      ])
      setTask(tr.data.task)
      setComments(cr.data.comments)
      setAttachments(ar.data.attachments)
    } finally {
      setLoading(false)
    }
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
      setComments(p => [...p, r.data.comment])
      setCommentText('')
    } finally {
      setPosting(false)
    }
  }

  const deleteComment = async (cid) => {
    await api.delete(`/comments/${cid}`)
    setComments(p => p.filter(c => c.id !== cid))
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fd = new FormData()
    fd.append('file', file)

    setUploading(true)
    try {
      const r = await api.post(`/tasks/${id}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAttachments(p => [...p, r.data.attachment])
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deleteAttachment = async (aid) => {
    await api.delete(`/attachments/${aid}`)
    setAttachments(p => p.filter(a => a.id !== aid))
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!task) return <div className="p-8 text-red-400">Task not found</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 max-w-6xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
        <Link to="/projects" className="hover:text-white">Projects</Link>
        <ChevronRight size={12} />
        <Link to={`/projects/${task.project_id}`} className="hover:text-white">
          {task.project_name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-white/70">{task.task_name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* TASK CARD */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">

            <div className="flex justify-between items-center mb-4">

              {isAdmin ? (
                <StatusBadge status={task.status} />
              ) : task.assigned_user_id === user?.id ? (
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  {NEXT_STATUS[task.status] && (
                    <button
                      onClick={() => handleStatusChange(NEXT_STATUS[task.status])}
                      className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded-lg"
                    >
                      Next <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <StatusBadge status={task.status} />
              )}

            </div>

            <h1 className="text-2xl font-bold mb-2">{task.task_name}</h1>

            <p className="text-white/50 mb-5">
              {task.description || 'No description'}
            </p>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-3 text-sm">

              <div className="bg-white/[0.03] p-3 rounded-xl">
                <p className="text-white/30 text-xs mb-1">Project</p>
                <Link to={`/projects/${task.project_id}`} className="text-indigo-400 flex items-center gap-1">
                  <Folder size={14} /> {task.project_name}
                </Link>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl">
                <p className="text-white/30 text-xs mb-1">Assigned</p>
                <p className="flex items-center gap-1 text-white/70">
                  <User size={14} /> {task.assigned_user_name || '—'}
                </p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl">
                <p className="text-white/30 text-xs mb-1">Priority</p>
                <p className={PRIORITY_COLORS[task.priority]}>
                  {task.priority}
                </p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl">
                <p className="text-white/30 text-xs mb-1">Deadline</p>
                <p className="flex items-center gap-1 text-white/70">
                  <Calendar size={14} /> {task.deadline || '—'}
                </p>
              </div>

            </div>
          </div>

          {/* COMMENTS */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">

            <h2 className="flex items-center gap-2 text-lg mb-4">
              <MessageCircle size={16} /> Comments ({comments.length})
            </h2>

            <form onSubmit={postComment} className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                {user.name?.charAt(0)}
              </div>

              <div className="flex-1">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm"
              >
                {posting ? '...' : 'Post'}
              </button>
            </form>

            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 group">

                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                    {c.user_name?.charAt(0)}
                  </div>

                  <div className="flex-1 bg-white/[0.03] p-3 rounded-xl">
                    <div className="flex justify-between text-xs text-white/40 mb-1">
                      <span>{c.user_name}</span>
                      <span>{c.timestamp?.slice(0,16)}</span>
                    </div>

                    <p className="text-sm text-white/60">{c.comment_text}</p>

                    {(c.user_id === user.id || isAdmin) && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 text-xs mt-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* ATTACHMENTS */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">

            <h3 className="flex items-center gap-2 text-sm text-white/40 mb-3 uppercase">
              <Paperclip size={14} /> Attachments ({attachments.length})
            </h3>

            <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-3 text-sm cursor-pointer hover:border-indigo-500">
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" hidden onChange={uploadFile} />
            </label>

            <div className="space-y-2 mt-3">
              {attachments.map(a => (
                <div key={a.id} className="flex justify-between items-center bg-white/[0.03] px-3 py-2 rounded-lg group">

                  <p className="text-xs text-white/60 truncate">{a.filename}</p>

                  <div className="flex gap-2">
                    <a href={`http://localhost:5000/api/attachments/${a.id}/download`} target="_blank">
                      <Download size={12} className="text-indigo-400" />
                    </a>

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