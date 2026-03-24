import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Folder,
  CheckCircle,
  Clock,
  ListTodo,
  Users,
  Activity
} from 'lucide-react'

const StatCard = ({ label, value, sub, icon: Icon }) => (
  <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 backdrop-blur-md flex items-center justify-between 
    transition-all duration-300 hover:scale-[1.04] hover:bg-white/[0.06]">
    
    <div>
      <p className="text-white/40 text-[11px] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>

    {Icon && (
      <Icon className="w-6 h-6 text-white/30 transition-transform duration-300 group-hover:rotate-6" />
    )}
  </div>
)

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
    <span className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${styles[status]}`}>
      {label[status]}
    </span>
  )
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white/40 p-10 animate-pulse">Loading…</div>
  if (!data) return <div className="text-red-400 p-10">Failed to load dashboard.</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">
          Good day, {user.name}
        </h1>
        <p className="text-white/40 text-sm">
          Here's what's happening across your workspace.
        </p>
      </div>

      {isAdmin ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Projects" value={data.total_projects} icon={Folder} />
            <StatCard label="Tasks" value={data.total_tasks} icon={ListTodo} />
            <StatCard
              label="Completed"
              value={data.completed_tasks}
              sub={`${data.total_tasks ? Math.round(data.completed_tasks / data.total_tasks * 100) : 0}% done`}
              icon={CheckCircle}
            />
            <StatCard label="In Progress" value={data.in_progress_tasks} icon={Activity} />
            <StatCard label="To Do" value={data.todo_tasks} icon={Clock} />
            <StatCard label="Team" value={data.total_users} icon={Users} />
          </div>

          {/* Project Table */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 animate-fade-in">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-semibold">Project Summary</h2>
              <Link to="/projects" className="text-indigo-400 text-xs hover:text-indigo-300">
                View all →
              </Link>
            </div>

            <table className="w-full text-sm">
              <thead className="text-white/40 border-b border-white/10">
                <tr>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">Completed</th>
                  <th className="p-3 text-center">In Progress</th>
                  <th className="p-3 text-center">To Do</th>
                </tr>
              </thead>

              <tbody>
                {data.tasks_per_project.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition">
                    <td className="p-3 font-medium">{p.project_name}</td>
                    <td className="p-3 text-center text-white/60">{p.total}</td>
                    <td className="p-3 text-center text-green-400">{p.completed}</td>
                    <td className="p-3 text-center text-indigo-300">{p.in_progress}</td>
                    <td className="p-3 text-center text-white/50">{p.todo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* User stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="My Projects" value={data.my_projects} icon={Folder} />
            <StatCard label="My Tasks" value={data.my_tasks} icon={ListTodo} />
            <StatCard label="Completed" value={data.completed} icon={CheckCircle} />
            <StatCard label="In Progress" value={data.in_progress} icon={Activity} />
          </div>

          {/* Tasks Table */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 animate-fade-in">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-semibold">Recent Tasks</h2>
              <Link to="/tasks" className="text-indigo-400 text-xs hover:text-indigo-300">
                View all →
              </Link>
            </div>

            <table className="w-full text-sm">
              <thead className="text-white/40 border-b border-white/10">
                <tr>
                  <th className="p-3 text-left">Task</th>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Deadline</th>
                </tr>
              </thead>

              <tbody>
                {data.recent_tasks.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.03] transition">
                    <td className="p-3">
                      <Link
                        to={`/tasks/${t.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        {t.task_name}
                      </Link>
                    </td>
                    <td className="p-3 text-white/60">{t.project_name}</td>
                    <td className="p-3 text-center">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="p-3 text-center text-white/40">
                      {t.deadline || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}