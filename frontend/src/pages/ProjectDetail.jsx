import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Plus, Users, Calendar, ArrowRight, X
} from 'lucide-react'

const NEXT_STATUS = { todo: 'in_progress', in_progress: 'completed', completed: null }

const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-white/10 text-white/60',
    in_progress: 'bg-indigo-500/20 text-indigo-300',
    completed: 'bg-green-500/20 text-green-300',
  }

  const label = {
    todo: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed',
  }

  return (
    <span className={`px-2 py-1 rounded-md text-[11px] ${styles[status]}`}>
      {label[status]}
    </span>
  )
}

/* ---------------- MODAL ---------------- */

function AddTaskModal({ projectId, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    task_name: '',
    description: '',
    assigned_user_id: '',
    priority: 'medium',
    deadline: ''
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/tasks/', {
        ...form,
        project_id: projectId,
        assigned_user_id: form.assigned_user_id || null
      })
      onSaved()
    } catch {
      alert('Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-[#0f0f17] border border-white/10 rounded-2xl p-6">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-white font-semibold">New Task</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">

          <input
            placeholder="Task name"
            required
            value={form.task_name}
            onChange={e => setForm(p => ({ ...p, task_name: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />

          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.assigned_user_id}
              onChange={e => setForm(p => ({ ...p, assigned_user_id: e.target.value }))}
              className="bg-slate-800 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
            >
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

            <select
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              className="bg-slate-800 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <input
            type="date"
            value={form.deadline}
            onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

/* ---------------- MAIN ---------------- */

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskFilter, setTaskFilter] = useState('')

  const fetchAll = async () => {
    try {
      const [pr, tr, ur] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/?project_id=${id}`),
        api.get('/auth/users'),
      ])
      setProject(pr.data.project)
      setTasks(tr.data.tasks)
      setUsers(ur.data.users)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleStatusChange = async (tid, status) => {
    await api.put(`/tasks/${tid}`, { status })
    setTasks(p => p.map(t => t.id === tid ? { ...t, status } : t))
  }

  if (loading) return <div className="text-white/40 p-10">Loading…</div>
  if (!project) return <div className="text-red-400 p-10">Project not found.</div>

  const filteredTasks = taskFilter ? tasks.filter(t => t.status === taskFilter) : tasks

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">

      {/* Header */}
      <div className="mb-6">
        <Link to="/projects" className="text-white/40 text-sm hover:text-white">
          ← Projects
        </Link>

        <h1 className="text-2xl font-bold mt-2">{project.project_name}</h1>
        <p className="text-white/40 text-sm">{project.description}</p>

        {project.deadline && (
          <div className="flex items-center gap-2 text-white/40 text-xs mt-2">
            <Calendar size={14} /> {project.deadline}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-sm font-semibold">Tasks</h2>

          <div className="flex gap-2">
            <select
              value={taskFilter}
              onChange={e => setTaskFilter(e.target.value)}
              className="bg-white/[0.05] border border-white/10 rounded-md text-xs px-2 py-1"
            >
              <option value="">All</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {isAdmin && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-md text-xs flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-white/40 border-b border-white/10">
            <tr>
              <th className="p-3 text-left">Task</th>
              <th className="p-3">Assigned</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map(t => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="p-3">
                  <Link to={`/tasks/${t.id}`} className="text-indigo-400 hover:text-indigo-300">
                    {t.task_name}
                  </Link>
                </td>

                <td className="p-3 text-white/60">{t.assigned_user_name || '—'}</td>

                <td className="p-3 text-white/40">{t.priority}</td>

                <td className="p-3">
                  {t.assigned_user_id === user?.id && NEXT_STATUS[t.status] ? (
                    <button
                      onClick={() => handleStatusChange(t.id, NEXT_STATUS[t.status])}
                      className="flex items-center gap-2 text-xs text-indigo-300 hover:text-indigo-200"
                    >
                      <StatusBadge status={t.status} />
                      <ArrowRight size={12} />
                    </button>
                  ) : (
                    <StatusBadge status={t.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTaskModal && (
        <AddTaskModal
          projectId={parseInt(id)}
          users={users}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => { setShowTaskModal(false); fetchAll() }}
        />
      )}
    </div>
  )
}