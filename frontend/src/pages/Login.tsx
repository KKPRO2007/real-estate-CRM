import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Building2, Eye, EyeOff } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

const GUEST_USER = {
  id: 0,
  name: 'Guest',
  email: 'guest@shared.local',
  role: 'shared workspace',
}

export default function Login() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<LoginForm>()

  const enterWorkspace = async () => {
    setLoading(true)
    try {
      localStorage.removeItem('token')
      localStorage.setItem('user', JSON.stringify(GUEST_USER))
      toast.success('Entered shared guest workspace')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d14] font-['DM_Sans',sans-serif]">
      <div className="hidden w-1/2 flex-col justify-between border-r border-white/[0.06] bg-[#0a0a12] p-12 lg:flex">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-indigo-400" />
          <span className="text-[14px] font-semibold text-white">Prop<span className="text-indigo-400">CRM</span></span>
        </div>
        <div>
          <h1 className="mb-4 text-4xl font-light leading-tight text-white">
            Shared real estate<br />
            <span className="font-semibold text-indigo-400">workspace</span><br />
            for every device.
          </h1>
          <p className="max-w-xs text-[13px] leading-relaxed text-slate-500">
            Leads, properties, clients, deals, and reports stay visible to everyone using the same guest workspace.
          </p>
        </div>
        <div className="flex gap-8">
          {[['Shared', 'Workspace'], ['Live', 'Database'], ['Guest', 'Access']].map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold text-white">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="mb-1 text-2xl font-semibold text-white">Enter Workspace</h2>
            <p className="text-[13px] text-slate-500">No account is required. Use the shared guest workspace from any device.</p>
          </div>

          <form onSubmit={handleSubmit(enterWorkspace)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-400">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-indigo-500/[0.03]"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 pr-10 text-[13px] text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-indigo-500/[0.03]"
                  placeholder="Optional"
                />
                <button type="button" onClick={() => setShowPass(prev => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Opening...' : 'Enter Shared Workspace'}
            </button>

            <button
              type="button"
              onClick={enterWorkspace}
              disabled={loading}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
            >
              Continue As Guest
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-600">
            All users share the same visible CRM data in guest mode.
          </p>
        </div>
      </div>
    </div>
  )
}
