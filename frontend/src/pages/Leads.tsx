import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api'
import { Plus, Search, Pencil, Trash2, X, ChevronDown, Phone, Mail, DollarSign, UserRound, Sparkles } from 'lucide-react'
import { formatDisplayDate } from '../utils/safe'

const STATUSES = ['new', 'contacted', 'qualified', 'closed', 'lost']
const SOURCES = ['website', 'referral', 'facebook', 'google', 'call', 'manual']
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  contacted: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  qualified: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  closed: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  lost: 'bg-red-500/10 text-red-300 border-red-500/20',
}

interface Lead {
  id: number
  name: string
  phone: string
  email: string
  budget: number
  source: string
  status: string
  assigned_to: number
  notes: string
  agent_name: string
  created_at: string
}

const formatMoney = (value?: number) => value ? `Rs ${(value / 100000).toFixed(1)}L` : 'No budget'

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>()

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const params: any = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const [leadsRes, agentsRes] = await Promise.all([api.get('/leads', { params }), api.get('/auth/agents')])
      setLeads(leadsRes.data)
      setAgents(agentsRes.data)
    } catch (err: any) {
      const message = err.response?.data?.error || 'The leads service is still starting. Please wait a moment and try again.'
      setError(message)
      setLeads([])
      setAgents([])
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, statusFilter])

  const openCreate = () => {
    setEditing(null)
    reset({ source: 'manual', status: 'new' })
    setShowModal(true)
  }

  const openEdit = (lead: Lead) => {
    setEditing(lead)
    reset(lead)
    setShowModal(true)
  }

  const onSubmit = async (data: any) => {
    try {
      if (editing) {
        await api.put(`/leads/${editing.id}`, data)
        toast.success('Lead updated')
      } else {
        await api.post('/leads', data)
        toast.success('Lead created')
      }
      setShowModal(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const deleteLead = async (id: number) => {
    if (!window.confirm('Delete this lead?')) return
    try {
      await api.delete(`/leads/${id}`)
      toast.success('Lead deleted')
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const metrics = useMemo(() => {
    const totalBudget = leads.reduce((sum, lead) => sum + (lead.budget || 0), 0)
    return [
      { label: 'Pipeline Leads', value: String(leads.length) },
      { label: 'Qualified', value: String(leads.filter(lead => lead.status === 'qualified').length) },
      { label: 'Won', value: String(leads.filter(lead => lead.status === 'closed').length) },
      { label: 'Budget Volume', value: `Rs ${(totalBudget / 100000).toFixed(1)}L` },
    ]
  }, [leads])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Leads</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">Track intent, source quality, and assignment health.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">
          <Plus size={13} /> Add Lead
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(metric => (
          <div key={metric.label} className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search leads..." className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2 pl-8 pr-3 text-[12px] text-slate-300 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/40" />
        </div>
        <div className="relative w-full md:w-auto">
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.04] py-2 pl-3 pr-8 text-[12px] text-slate-300 outline-none transition-colors focus:border-indigo-500/40 md:w-[180px]">
            <option value="">All Status</option>
            {STATUSES.map(status => <option key={status} value={status} className="bg-[#0f0f1a] capitalize">{status}</option>)}
          </select>
          <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] px-6 py-16 text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-white">Loading leads</p>
          <p className="mt-1 text-[12px] text-slate-500">The shared demo data may need a few seconds to wake up.</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-16 text-center">
          <p className="text-sm font-medium text-amber-300">Leads are not ready yet</p>
          <p className="mt-2 text-[12px] text-slate-400">{error}</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#0f0f1a] px-6 py-16 text-center">
          <p className="text-[13px] text-slate-500">No leads found for the current filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {leads.map(lead => (
            <div key={lead.id} className="group rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-[#121320]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-white">{lead.name}</h3>
                    <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[lead.status] || ''}`}>{lead.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Created {formatDisplayDate(lead.created_at)} • Source: <span className="capitalize text-slate-400">{lead.source || 'manual'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button onClick={() => openEdit(lead)} className="rounded-lg p-2 text-slate-500 transition-all hover:bg-white/[0.06] hover:text-slate-100"><Pencil size={12} /></button>
                  <button onClick={() => deleteLead(lead.id)} className="rounded-lg p-2 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-300"><Trash2 size={12} /></button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3 text-slate-200 transition-colors group-hover:border-white/[0.08] group-hover:bg-white/[0.05]">
                  <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><DollarSign size={11} /> Budget</p>
                  <p className="text-sm font-medium text-white">{formatMoney(lead.budget)}</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3 text-slate-200 transition-colors group-hover:border-white/[0.08] group-hover:bg-white/[0.05]">
                  <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><UserRound size={11} /> Assigned Agent</p>
                  <p className="text-sm font-medium text-white">{lead.agent_name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.05] bg-[#0c0d16] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Contact</p>
                  <div className="space-y-2 text-[12px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-slate-500" />
                      <span>{lead.phone || 'No phone added'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-500" />
                      <span className="truncate">{lead.email || 'No email added'}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-[#0c0d16] p-3">
                  <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Sparkles size={11} /> Notes</p>
                  <p className="line-clamp-3 text-[12px] leading-relaxed text-slate-400">{lead.notes || 'No notes yet for this lead.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0f0f1a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-[14px] font-semibold text-white">{editing ? 'Edit Lead' : 'New Lead'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 transition-colors hover:text-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Name *</label>
                  <input {...register('name', { required: true })} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                  {errors.name && <p className="mt-1 text-[10px] text-red-400">Required</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Phone</label>
                  <input {...register('phone')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Email</label>
                  <input {...register('email')} type="email" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Budget (INR)</label>
                  <input {...register('budget')} type="number" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Source</label>
                  <select {...register('source')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    {SOURCES.map(source => <option key={source} value={source} className="bg-[#0f0f1a] capitalize">{source}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Status</label>
                  <select {...register('status')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    {STATUSES.map(status => <option key={status} value={status} className="bg-[#0f0f1a] capitalize">{status}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Assign Agent</label>
                  <select {...register('assigned_to')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    <option value="">Unassigned</option>
                    {agents.map(agent => <option key={agent.id} value={agent.id} className="bg-[#0f0f1a]">{agent.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Notes</label>
                  <textarea {...register('notes')} rows={3} className="w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                </div>
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
