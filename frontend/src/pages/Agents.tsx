import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api'
import { Pencil, Trash2, X, Handshake, Users, TrendingUp, ShieldCheck } from 'lucide-react'

const ROLES = ['admin', 'manager', 'agent']
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  manager: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  agent: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}

interface Agent {
  id: number
  name: string
  email: string
  role: string
  lead_count: number
  deal_count: number
  total_commission: number
  created_at: string
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Agent | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, string>>()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = currentUser.role === 'admin'

  const load = async () => {
    try {
      const res = await api.get('/agents')
      setAgents(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ role: 'agent' })
    setShowModal(true)
  }

  const openEdit = (agent: Agent) => {
    setEditing(agent)
    reset({
      name: agent.name,
      email: agent.email,
      role: agent.role,
    })
    setShowModal(true)
  }

  const onSubmit = async (data: Record<string, string>) => {
    try {
      if (editing) {
        await api.put(`/agents/${editing.id}`, data)
        toast.success('Agent updated')
      } else {
        await api.post('/auth/register', data)
        toast.success('Agent created')
      }
      setShowModal(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const deleteAgent = async (id: number) => {
    if (!window.confirm('Delete this agent?')) return
    try {
      await api.delete(`/agents/${id}`)
      toast.success('Agent deleted')
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const initials = (name: string) => name?.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
  const avatarColors = ['bg-indigo-500/20 text-indigo-300', 'bg-emerald-500/20 text-emerald-300', 'bg-amber-500/20 text-amber-300', 'bg-violet-500/20 text-violet-300', 'bg-rose-500/20 text-rose-300']

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Agents</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">{agents.length} team members</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="rounded-lg bg-indigo-600 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">
            + Add Agent
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Admins & Managers</p>
          <p className="mt-2 text-2xl font-semibold text-white">{agents.filter(agent => agent.role !== 'agent').length}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Assigned Leads</p>
          <p className="mt-2 text-2xl font-semibold text-white">{agents.reduce((sum, agent) => sum + (agent.lead_count || 0), 0)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Closed Commission</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            Rs {(agents.reduce((sum, agent) => sum + (agent.total_commission || 0), 0) / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {agents.map((agent, index) => (
            <div key={agent.id} className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${avatarColors[index % avatarColors.length]}`}>
                    {initials(agent.name)}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-slate-100">{agent.name}</p>
                    <p className="text-[12px] text-slate-500">{agent.email}</p>
                  </div>
                </div>
                <span className={`rounded-full border px-2 py-1 text-[10px] capitalize ${ROLE_COLORS[agent.role] || ''}`}>
                  {agent.role}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-slate-500"><Users size={12} /><span className="text-[10px] uppercase tracking-wider">Leads</span></div>
                  <p className="mt-2 text-lg font-semibold text-white">{agent.lead_count || 0}</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-slate-500"><Handshake size={12} /><span className="text-[10px] uppercase tracking-wider">Deals</span></div>
                  <p className="mt-2 text-lg font-semibold text-white">{agent.deal_count || 0}</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-slate-500"><TrendingUp size={12} /><span className="text-[10px] uppercase tracking-wider">Commission</span></div>
                  <p className="mt-2 text-lg font-semibold text-white">Rs {((agent.total_commission || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck size={12} />
                  Joined {new Date(agent.created_at).toLocaleDateString('en-IN')}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(agent)} className="rounded-lg p-2 text-slate-500 transition-all hover:bg-white/[0.06] hover:text-slate-200"><Pencil size={13} /></button>
                    {agent.id !== currentUser.id && (
                      <button onClick={() => deleteAgent(agent.id)} className="rounded-lg p-2 text-slate-500 transition-all hover:bg-red-500/5 hover:text-red-400"><Trash2 size={13} /></button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0f0f1a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-[14px] font-semibold text-white">{editing ? 'Edit Agent' : 'New Agent'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 transition-colors hover:text-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Name *</label>
                <input {...register('name', { required: true })} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                {errors.name && <p className="mt-1 text-[10px] text-red-400">Required</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Email *</label>
                <input {...register('email', { required: true })} type="email" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                {errors.email && <p className="mt-1 text-[10px] text-red-400">Required</p>}
              </div>
              {!editing && (
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Password *</label>
                  <input {...register('password', { required: true })} type="password" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                  {errors.password && <p className="mt-1 text-[10px] text-red-400">Required</p>}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Role</label>
                <select {...register('role')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                  {ROLES.map(role => <option key={role} value={role} className="bg-[#0f0f1a] capitalize">{role}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.04] py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.07]">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-indigo-600 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
