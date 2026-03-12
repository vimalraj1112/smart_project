import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import api from '../services/api'

const PIE_COLORS = ['#111827','#9ca3af','#e5e7eb']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontSize:'0.8125rem', boxShadow:'var(--shadow-md)' }}>
      {label && <p style={{ fontWeight:500, marginBottom:4, color:'var(--text-primary)' }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

const StatCard = ({ label, value }) => (
  <div className="card" style={{ padding:'1.25rem 1.5rem' }}>
    <p style={{ fontSize:'0.6875rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500, marginBottom:4 }}>{label}</p>
    <p style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>{value}</p>
  </div>
)

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/analytics/dashboard').then(r=>setData(r.data)).catch(console.error).finally(()=>setLoading(false)) }, [])

  if (loading) return <div style={{ padding:'3rem', color:'var(--text-muted)' }}>Loading analytics…</div>
  if (!data) return <div style={{ padding:'3rem', color:'#dc2626' }}>Failed to load analytics.</div>

  const pieData = [
    { name: 'Completed',    value: data.completed_tasks },
    { name: 'In Progress',  value: data.in_progress_tasks },
    { name: 'To Do',        value: data.todo_tasks },
  ]

  const projectBarData = data.tasks_per_project.map(p => ({
    name: p.project_name.length > 16 ? p.project_name.slice(0,14)+'…' : p.project_name,
    Done:        p.completed,
    'In Progress': p.in_progress,
    'To Do':     p.todo,
  }))

  const userBarData = data.tasks_per_user.slice(0, 8).map(u => ({
    name:      u.user_name.length > 12 ? u.user_name.slice(0,10)+'…' : u.user_name,
    Assigned:  u.total_assigned,
    Completed: u.completed,
  }))

  const completionRate = data.total_tasks > 0 ? Math.round(data.completed_tasks / data.total_tasks * 100) : 0

  const axisStyle = { fill: '#9ca3af', fontSize: 11 }

  return (
    <div className="page-body">
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Overview of project progress, task distribution, and team performance.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'1rem', marginBottom:'1.75rem' }}>
        <StatCard label="Total Projects" value={data.total_projects} />
        <StatCard label="Total Tasks" value={data.total_tasks} />
        <StatCard label="Completed" value={data.completed_tasks} />
        <StatCard label="In Progress" value={data.in_progress_tasks} />
        <StatCard label="Team Members" value={data.total_users} />
        <div className="card" style={{ padding:'1.25rem 1.5rem' }}>
          <p style={{ fontSize:'0.6875rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500, marginBottom:6 }}>Completion</p>
          <p style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1, marginBottom:6 }}>{completionRate}%</p>
          <div style={{ height:5, background:'var(--bg-muted)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${completionRate}%`, background:'#111827', borderRadius:3 }} />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        {/* Pie */}
        <div className="card" style={{ padding:'1.25rem' }}>
          <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'1rem' }}>Task Distribution</h2>
          {data.total_tasks === 0
            ? <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'3rem 0', fontSize:'0.875rem' }}>No tasks yet.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => percent>0.05 ? `${(percent*100).toFixed(0)}%` : ''} labelLine={false}>
                    {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize:'0.75rem', color:'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Project bar */}
        <div className="card" style={{ padding:'1.25rem' }}>
          <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'1rem' }}>Tasks per Project</h2>
          {projectBarData.length === 0
            ? <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'3rem 0', fontSize:'0.875rem' }}>No projects.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectBarData} margin={{ top:0, right:10, left:-10, bottom:24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={axisStyle} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={axisStyle} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize:'0.75rem', color:'var(--text-secondary)' }} />
                  <Bar dataKey="Done" fill="#111827" radius={[3,3,0,0]} />
                  <Bar dataKey="In Progress" fill="#9ca3af" radius={[3,3,0,0]} />
                  <Bar dataKey="To Do" fill="#e5e7eb" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* User productivity */}
      <div className="card" style={{ padding:'1.25rem', marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'1rem' }}>User Productivity</h2>
        {userBarData.length === 0
          ? <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', padding:'1rem' }}>No users.</p>
          : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={userBarData} margin={{ top:0, right:10, left:-10, bottom:24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={axisStyle} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:'0.75rem', color:'var(--text-secondary)' }} />
                <Bar dataKey="Assigned" fill="#9ca3af" radius={[3,3,0,0]} />
                <Bar dataKey="Completed" fill="#111827" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </div>

      {/* Leaderboard table */}
      <div className="card">
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>Team Progress</h2>
        </div>
        <table className="table">
          <thead>
            <tr><th>#</th><th>Member</th><th>Assigned</th><th>Completed</th><th style={{ width:200 }}>Progress</th></tr>
          </thead>
          <tbody>
            {data.tasks_per_user.length === 0
              ? <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>No data.</td></tr>
              : data.tasks_per_user.map((u, i) => {
                  const pct = u.total_assigned > 0 ? Math.round(u.completed/u.total_assigned*100) : 0
                  return (
                    <tr key={u.user_id}>
                      <td style={{ color:'var(--text-muted)', fontWeight:500 }}>{i+1}</td>
                      <td style={{ fontWeight:500 }}>{u.user_name}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{u.total_assigned}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{u.completed}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:5, background:'var(--bg-muted)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:'#111827', borderRadius:3 }} />
                          </div>
                          <span style={{ fontSize:'0.6875rem', color:'var(--text-muted)', width:30, textAlign:'right' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
