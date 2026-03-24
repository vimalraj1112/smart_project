import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Plus,
  Trash2,
  Filter,
  Folder,
  User,
  Calendar,
  MessageCircle,
  Paperclip
} from 'lucide-react'

const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-slate-600/30 text-slate-300 border-slate-500/30',
    in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }
  const label = { todo:'To Do', in_progress:'In Progress', completed:'Completed' }

  return (
    <span className={`px-2 py-1 text-xs rounded-lg border ${styles[status]}`}>
      {label[status]}
    </span>
  )
}

const PriBadge = ({ p }) => {
  const styles = {
    low:'text-emerald-400',
    medium:'text-amber-400',
    high:'text-red-400'
  }
  return <span className={`text-xs font-semibold ${styles[p]}`}>↑ {p}</span>
}

function TaskModal({ projectId, users, projects, onClose, onSaved }) {
  const [form, setForm] = useState({
    task_name:'',
    description:'',
    project_id: projectId||'',
    assigned_user_id:'',
    priority:'medium',
    deadline:''
  })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/tasks/', {
        ...form,
        project_id: parseInt(form.project_id),
        assigned_user_id: form.assigned_user_id||null
      })
      onSaved()
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-white text-lg font-semibold mb-4">New Task</h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            required
            placeholder="Task name"
            value={form.task_name}
            onChange={e=>setForm(p=>({...p,task_name:e.target.value}))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={e=>setForm(p=>({...p,description:e.target.value}))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
          />

          {!projectId && (
            <select
              required
              value={form.project_id}
              onChange={e=>setForm(p=>({...p,project_id:e.target.value}))}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
            >
              <option value="">Select Project</option>
              {projects.map(p=>(
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.assigned_user_id}
              onChange={e=>setForm(p=>({...p,assigned_user_id:e.target.value}))}
              className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
            >
              <option value="">Assign</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>

            <select
              value={form.priority}
              onChange={e=>setForm(p=>({...p,priority:e.target.value}))}
              className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <input
            type="date"
            value={form.deadline}
            onChange={e=>setForm(p=>({...p,deadline:e.target.value}))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2"
          />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-white/10 text-white rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [tr, pr, ur] = await Promise.all([
        api.get(`/tasks/`),
        api.get('/projects/'),
        api.get('/auth/users'),
      ])
      setTasks(tr.data.tasks)
      setProjects(pr.data.projects)
      setUsers(ur.data.users)
    } finally { setLoading(false) }
  }, [])

  useEffect(()=>{ fetchAll() },[fetchAll])

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-white/40 text-sm">{tasks.length} tasks</p>
        </div>

        {isAdmin && (
          <button
            onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl hover:bg-indigo-500"
          >
            <Plus size={16}/> New Task
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="p-3 text-left">Task</th>
              <th>Project</th>
              <th>User</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Deadline</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-10">Loading...</td></tr>
            ) : tasks.map(t => (
              <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                
                <td className="p-3">
                  <Link to={`/tasks/${t.id}`} className="font-medium hover:text-indigo-400">
                    {t.task_name}
                  </Link>

                  {(t.comment_count>0 || t.attachment_count>0) && (
                    <div className="flex gap-2 text-xs text-white/40 mt-1">
                      {t.comment_count>0 && <span className="flex items-center gap-1"><MessageCircle size={12}/> {t.comment_count}</span>}
                      {t.attachment_count>0 && <span className="flex items-center gap-1"><Paperclip size={12}/> {t.attachment_count}</span>}
                    </div>
                  )}
                </td>

                <td><span className="flex items-center gap-1 text-white/70"><Folder size={14}/> {t.project_name}</span></td>
                <td><span className="flex items-center gap-1 text-white/70"><User size={14}/> {t.assigned_user_name||'—'}</span></td>
                <td><PriBadge p={t.priority} /></td>
                <td><StatusBadge status={t.status} /></td>
                <td><span className="flex items-center gap-1 text-white/50"><Calendar size={14}/> {t.deadline||'—'}</span></td>

                {isAdmin && (
                  <td>
                    <button
                      onClick={()=>api.delete(`/tasks/${t.id}`).then(fetchAll)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TaskModal
          projects={projects}
          users={users}
          onClose={()=>setShowModal(false)}
          onSaved={()=>{ setShowModal(false); fetchAll() }}
        />
      )}
    </div>
  )
}