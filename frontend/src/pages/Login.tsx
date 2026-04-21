import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api'
import { Building2, Eye, EyeOff } from 'lucide-react'

interface LoginForm { email: string; password: string }

const DEMO_USER = {
  email: 'admin@demo.local',
  password: '123test',
  fallbackUser: {
    id: 1,
    name: 'Admin',
    email: 'admin@demo.local',
    role: 'admin',
  },
}

export default function Login() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Welcome back')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const bypassLogin = async () => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: DEMO_USER.email,
        password: DEMO_USER.password,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success('Demo access enabled')
    } catch {
      localStorage.setItem('token', 'demo-bypass-token')
      localStorage.setItem('user', JSON.stringify(DEMO_USER.fallbackUser))
      toast.success('Opened in local demo mode')
    } finally {
      setLoading(false)
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] flex font-['DM_Sans',sans-serif]">
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-[#0a0a12] border-r border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-indigo-400" />
          <span className="text-[14px] font-semibold text-white">Prop<span className="text-indigo-400">CRM</span></span>
        </div>
        <div>
          <h1 className="text-4xl font-light text-white leading-tight mb-4">
            Manage your<br />
            <span className="text-indigo-400 font-semibold">real estate</span><br />
            operations.
          </h1>
          <p className="text-[13px] text-slate-500 leading-relaxed max-w-xs">
            Leads, properties, deals, clients — everything in one place for your team.
          </p>
        </div>
        <div className="flex gap-8">
          {[['284', 'Active Leads'], ['138', 'Properties'], ['47', 'Open Deals']].map(([val, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold text-white">{val}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-1">Sign in</h2>
            <p className="text-[13px] text-slate-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                type="email"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.03] transition-all"
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 pr-10 text-[13px] text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.03] transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={bypassLogin}
              disabled={loading}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
            >
              Continue With Demo Access
            </button>
          </form>

          <p className="text-[11px] text-slate-600 mt-6 text-center">
            No account? Ask your admin to create one.
          </p>
        </div>
      </div>
    </div>
  )
}
