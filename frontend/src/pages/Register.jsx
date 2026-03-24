import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Mail, Lock, User, ArrowRight, CheckSquare } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left panel same as login */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#0a0a12] to-[#0d1117]" />

        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold text-[15px]">SmartTask</span>
          </div>
        </div>

        <div className="relative z-10">
  <p className="text-indigo-400 text-[11px] font-semibold tracking-[0.12em] uppercase mb-5">
    Work smarter, not harder
  </p>

  <h2
    className="text-white text-5xl font-bold leading-[1.1] tracking-[-0.03em] mb-6"
    style={{ fontFamily: "'Syne', sans-serif" }}
  >
    Every task,<br />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
      perfectly timed.
    </span>
  </h2>

  <p className="text-white/40 text-[15px] leading-relaxed max-w-sm">
    SmartTask keeps your team aligned, your projects on track,
    and your focus where it matters most.
  </p>
</div>

{/* Floating feature cards */}
<div className="relative z-10 space-y-3">
  {[
    { icon: '⚡', label: 'AI-powered prioritization', sub: 'Auto-sort tasks by impact' },
    { icon: '🔗', label: 'Seamless integrations', sub: 'Slack, GitHub, Notion & more' },
    { icon: '📊', label: 'Real-time analytics', sub: 'Track velocity & throughput' },
  ].map((f, i) => (
    <div
      key={i}
      className="flex items-center gap-3.5 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 backdrop-blur-sm"
      style={{
        transition: 'opacity 0.5s, transform 0.5s',
        transitionDelay: `${i * 80 + 200}ms`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
      }}
    >
      <span className="text-lg">{f.icon}</span>
      <div>
        <p className="text-white/80 text-[13px] font-medium">{f.label}</p>
        <p className="text-white/30 text-[11px]">{f.sub}</p>
      </div>
    </div>
  ))}
</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">

        <div
          className="w-full max-w-[400px]"
          style={{
            transition: 'all 0.6s',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)'
          }}
        >

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold text-[15px]">SmartTask</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">
              Create account
            </h1>
            <p className="text-white/40 text-sm">
              Start managing your tasks smarter.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-white/60 text-xs mb-2 block">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.09] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-white/60 text-xs mb-2 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.09] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs mb-2 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.09] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Creating…' : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-white/30 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}