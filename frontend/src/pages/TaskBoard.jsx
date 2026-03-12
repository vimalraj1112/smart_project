import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: '📌', color: 'border-slate-600 bg-slate-800/40' },
  { id: 'in_progress', label: 'In Progress', icon: '⚡', color: 'border-amber-600/40 bg-amber-900/10' },
  { id: 'completed', label: 'Completed', icon: '✅', color: 'border-emerald-600/40 bg-emerald-900/10' },
]

const PRIORITY_COLORS = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' }

function TaskCard({ task, isAdmin, onStatusChange, onDelete }) {
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 shadow hover:border-indigo-500/40 transition-all group">
      <Link to={`/tasks/${task.id}`}>
        <p className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors mb-1">{task.task_name}</p>
        {task.description && <p className="text-slate-400 text-xs line-clamp-2 mb-2">{task.description}</p>}
      </Link>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs font-semibold ${PRIORITY_COLORS[task.priority] || 'text-slate-400'}`}>↑ {task.priority?.toUpperCase()}</span>
        {task.deadline && <span className="text-slate-500 text-xs">📅 {task.deadline}</span>}
      </div>
      {task.assigned_user_name && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">{task.assigned_user_name.charAt(0)}</div>
          <span className="text-slate-400 text-xs">{task.assigned_user_name}</span>
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50">
        <span className="text-slate-500 text-xs">💬 {task.comment_count}</span>
        <span className="text-slate-500 text-xs">📎 {task.attachment_count}</span>
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'todo' && (
            <button onClick={() => onStatusChange(task.id, task.status === 'in_progress' ? 'todo' : 'in_progress')}
              className="text-xs text-slate-400 hover:text-amber-400 px-1">← Back</button>
          )}
          {task.status !== 'completed' && (
            <button onClick={() => onStatusChange(task.id, task.status === 'todo' ? 'in_progress' : 'completed')}
              className="text-xs text-slate-400 hover:text-emerald-400 px-1">Next →</button>
          )}
          {isAdmin && (
            <button onClick={() => onDelete(task.id)} className="text-xs text-slate-400 hover:text-red-400 px-1">🗑️</button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddTaskModal({ projectId, users, onClose, onSaved }) {
  const [form, setForm] = useState({ task_name: '', description: '', assigned_user_id: '', priority: 'medium', deadline: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/tasks/', { ...form, project_id: projectId, assigned_user_id: form.assigned_user_id || null })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-5">New Task</h2>
        {error && <div className="mb-3 p-2 bg-red-900/40 text-red-300 rounded text-sm">⚠️ {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Task name *" value={form.task_name} onChange={e => setForm(p=>({...p, task_name: e.target.value}))}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p=>({...p, description: e.target.value}))} rows={2}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/>
          <select value={form.assigned_user_id} onChange={e => setForm(p=>({...p, assigned_user_id: e.target.value}))}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">— Assign to —</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={e => setForm(p=>({...p, priority: e.target.value}))}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={form.deadline} onChange={e => setForm(p=>({...p, deadline: e.target.value}))}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    await api.delete(`/tasks/${taskId}`)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"/></div>

  const tasksByStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/projects/${id}`} className="text-slate-400 hover:text-white text-sm">← {project?.project_name}</Link>
          </div>
          <h1 className="text-3xl font-bold text-white">Task Board</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg transition-all">
            + New Task
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div key={col.id} className={`rounded-2xl border ${col.color} p-4 min-h-96`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">{col.icon} {col.label}</h2>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{tasksByStatus(col.id).length}</span>
            </div>
            <div className="space-y-3">
              {tasksByStatus(col.id).length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No tasks here</p>
              )}
              {tasksByStatus(col.id).map(task => (
                <TaskCard key={task.id} task={task} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddTaskModal projectId={parseInt(id)} users={users} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
      )}
    </div>
  )
}
