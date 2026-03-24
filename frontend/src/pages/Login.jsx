import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Mail, Lock, ArrowRight, Zap, CheckSquare } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
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
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#0a0a12] to-[#0d1117]" />

        {/* Glow orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-[45%] left-[30%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <CheckSquare size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-[15px] tracking-[-0.01em]">SmartTask</span>
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

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        {/* Subtle right glow */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

        <div
          className="w-full max-w-[400px] relative z-10"
          style={{
            transition: 'opacity 0.6s, transform 0.6s',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <CheckSquare size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-[15px]">SmartTask</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-white text-3xl font-bold tracking-[-0.025em] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Welcome back
            </h1>
            <p className="text-white/40 text-sm">Sign in to continue to your workspace.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/25 text-red-400 text-[13px] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-white/60 text-[12px] font-medium tracking-[0.04em] uppercase mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.09] text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-[12px] font-medium tracking-[0.04em] uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.09] text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] rounded-xl py-3 flex items-center justify-center gap-2.5 transition-all duration-200 hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-white/20 text-[11px] tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* SSO placeholder */}
          <button
            type="button"
            className="w-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-white/60 hover:text-white/80 text-[13px] font-medium rounded-xl py-3 flex items-center justify-center gap-2.5 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-white/30 text-[13px] text-center mt-8">
            No account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150"
            >
              Create one free
            </Link>
          </p>

          <p className="text-white/15 text-[11px] text-center mt-6">
            Admin account? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}