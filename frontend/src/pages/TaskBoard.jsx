import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Plus, ArrowLeft, Calendar, MessageCircle, Paperclip,
  Trash2, ChevronRight, ChevronLeft, User
} from 'lucide-react'

const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
]

const PRIORITY_COLORS = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400'
}

/* ---------------- TASK CARD ---------------- */
function TaskCard({ task, isAdmin, onStatusChange, onDelete }) {
  return (
    <div className="group bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 backdrop-blur-md hover:border-indigo-500/40 transition-all">

      <Link to={`/tasks/${task.id}`}>
        <p className="text-white font-medium text-sm group-hover:text-indigo-300 transition mb-1">
          {task.task_name}
        </p>

        {task.description && (
          <p className="text-white/40 text-xs line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
      </Link>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className={`font-semibold ${PRIORITY_COLORS[task.priority]}`}>
          ↑ {task.priority?.toUpperCase()}
        </span>

        {task.deadline && (
          <span className="flex items-center gap-1 text-white/30">
            <Calendar size={12} />
            {task.deadline}
          </span>
        )}
      </div>

      {task.assigned_user_name && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white">
            {task.assigned_user_name.charAt(0)}
          </div>
          <span className="text-white/40 text-xs">
            {task.assigned_user_name}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/[0.05] text-white/30 text-xs">
        <span className="flex items-center gap-1">
          <MessageCircle size={12} /> {task.comment_count}
        </span>
        <span className="flex items-center gap-1">
          <Paperclip size={12} /> {task.attachment_count}
        </span>

        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition">

          {task.status !== 'todo' && (
            <button
              onClick={() =>
                onStatusChange(
                  task.id,
                  task.status === 'in_progress' ? 'todo' : 'in_progress'
                )
              }
              className="p-1 hover:text-amber-400"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          {task.status !== 'completed' && (
            <button
              onClick={() =>
                onStatusChange(
                  task.id,
                  task.status === 'todo' ? 'in_progress' : 'completed'
                )
              }
              className="p-1 hover:text-emerald-400"
            >
              <ChevronRight size={14} />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- ADD TASK MODAL ---------------- */
function AddTaskModal({ projectId, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    task_name: '',
    description: '',
    assigned_user_id: '',
    priority: 'medium',
    deadline: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/tasks/', {
        ...form,
        project_id: projectId,
        assigned_user_id: form.assigned_user_id || null
      })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">

        <h2 className="text-white text-lg font-semibold mb-4">New Task</h2>

        {error && (
          <div className="mb-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            required
            placeholder="Task name"
            value={form.task_name}
            onChange={e => setForm(p => ({ ...p, task_name: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
          />

          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm resize-none"
          />

          <select
            value={form.assigned_user_id}
            onChange={e => setForm(p => ({ ...p, assigned_user_id: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
          >
            <option value="">Assign user</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              className="bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              className="bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} type="button" className="text-white/40 hover:text-white text-sm">
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Plus size={14} />
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------------- MAIN ---------------- */
export default function TaskBoard() {
  const { id } = useParams()
  const { isAdmin } = useAuth()

  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [tasksRes, projRes, usersRes] = await Promise.all([
        api.get(`/tasks/?project_id=${id}`),
        api.get(`/projects/${id}`),
        api.get('/auth/users')
      ])
      setTasks(tasksRes.data.tasks)
      setProject(projRes.data.project)
      setUsers(usersRes.data.users)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}`, { status: newStatus })
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete task?')) return
    await api.delete(`/tasks/${taskId}`)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <Link to={`/projects/${id}`} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-1">
            <ArrowLeft size={14} /> {project?.project_name}
          </Link>

          <h1 className="text-2xl font-bold">Task Board</h1>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm flex items-center gap-2"
          >
            <Plus size={14} /> New Task
          </button>
        )}
      </div>

      {/* Columns */}
      <div className="grid md:grid-cols-3 gap-6">

        {COLUMNS.map(col => (
          <div key={col.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">

            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-white">{col.label}</h2>
              <span className="text-xs text-white/40 bg-white/[0.05] px-2 py-0.5 rounded-full">
                {tasksByStatus(col.id).length}
              </span>
            </div>

            <div className="space-y-3">
              {tasksByStatus(col.id).length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6">
                  No tasks
                </p>
              ) : (
                tasksByStatus(col.id).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

          </div>
        ))}

      </div>

      {showModal && (
        <AddTaskModal
          projectId={parseInt(id)}
          users={users}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </div>
  )
}