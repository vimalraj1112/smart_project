import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import api from '../services/api'

const PIE_COLORS = ['#6366f1','#8b5cf6','#22d3ee']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f17] border border-white/10 rounded-lg px-3 py-2 text-xs backdrop-blur-md">
      {label && <p className="text-white font-medium mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const StatCard = ({ label, value }) => (
  <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 backdrop-blur-md">
    <p className="text-white/40 text-[11px] uppercase tracking-wider mb-1">{label}</p>
    <p className="text-white text-2xl font-bold">{value}</p>
  </div>
)

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-white/40 p-10">Loading analytics…</div>
  if (!data) return <div className="text-red-400 p-10">Failed to load analytics.</div>

  const pieData = [
    { name: 'Completed', value: data.completed_tasks },
    { name: 'In Progress', value: data.in_progress_tasks },
    { name: 'To Do', value: data.todo_tasks },
  ]

  const projectBarData = data.tasks_per_project.map(p => ({
    name: p.project_name.length > 16 ? p.project_name.slice(0,14)+'…' : p.project_name,
    Done: p.completed,
    'In Progress': p.in_progress,
    'To Do': p.todo,
  }))

  const userBarData = data.tasks_per_user.slice(0, 8).map(u => ({
    name: u.user_name.length > 12 ? u.user_name.slice(0,10)+'…' : u.user_name,
    Assigned: u.total_assigned,
    Completed: u.completed,
  }))

  const completionRate = data.total_tasks > 0
    ? Math.round(data.completed_tasks / data.total_tasks * 100)
    : 0

  const axisStyle = { fill: '#9ca3af', fontSize: 11 }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-white/40 text-sm">
          Overview of project progress and team performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Projects" value={data.total_projects} />
        <StatCard label="Tasks" value={data.total_tasks} />
        <StatCard label="Completed" value={data.completed_tasks} />
        <StatCard label="In Progress" value={data.in_progress_tasks} />
        <StatCard label="Team" value={data.total_users} />

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4">
          <p className="text-white/40 text-[11px] uppercase mb-1">Completion</p>
          <p className="text-white text-2xl font-bold mb-2">{completionRate}%</p>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Pie */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Task Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Project chart */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Tasks per Project</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectBarData}>
              <CartesianGrid stroke="#1f2937" />
              <XAxis dataKey="name" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Done" fill="#6366f1" />
              <Bar dataKey="In Progress" fill="#8b5cf6" />
              <Bar dataKey="To Do" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User chart */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">User Productivity</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={userBarData}>
            <CartesianGrid stroke="#1f2937" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Assigned" fill="#8b5cf6" />
            <Bar dataKey="Completed" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold">Team Progress</h2>
        </div>

        <table className="w-full text-sm">
          <thead className="text-white/40 border-b border-white/10">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Member</th>
              <th className="p-3">Assigned</th>
              <th className="p-3">Completed</th>
              <th className="p-3">Progress</th>
            </tr>
          </thead>

          <tbody>
            {data.tasks_per_user.map((u, i) => {
              const pct = u.total_assigned > 0
                ? Math.round(u.completed / u.total_assigned * 100)
                : 0

              return (
                <tr key={u.user_id} className="border-b border-white/5">
                  <td className="p-3 text-white/40">{i + 1}</td>
                  <td className="p-3">{u.user_name}</td>
                  <td className="p-3 text-center text-white/60">{u.total_assigned}</td>
                  <td className="p-3 text-center text-white/60">{u.completed}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40 w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}