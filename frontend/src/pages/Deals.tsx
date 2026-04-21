import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api'
import { Plus, X, DollarSign, Pencil, Trash2, ArrowRight, BriefcaseBusiness, CircleDollarSign, Trophy, Sparkles } from 'lucide-react'

const STAGES = ['inquiry', 'negotiation', 'agreement', 'closed', 'lost']
const STAGE_LABELS: Record<string, string> = {
  inquiry: 'Inquiry',
  negotiation: 'Negotiation',
  agreement: 'Agreement',
  closed: 'Closed',
  lost: 'Lost',
}
const STAGE_STYLES: Record<string, { column: string; chip: string; accent: string }> = {
  inquiry: { column: 'border-indigo-500/30 bg-[linear-gradient(180deg,rgba(99,102,241,0.10),rgba(15,15,26,0.96))]', chip: 'bg-indigo-500/12 text-indigo-300 border-indigo-500/25', accent: 'from-indigo-400/40 to-indigo-500/5' },
  negotiation: { column: 'border-amber-500/30 bg-[linear-gradient(180deg,rgba(245,158,11,0.10),rgba(22,18,15,0.96))]', chip: 'bg-amber-500/12 text-amber-300 border-amber-500/25', accent: 'from-amber-400/40 to-amber-500/5' },
  agreement: { column: 'border-emerald-500/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(12,22,20,0.96))]', chip: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25', accent: 'from-emerald-400/40 to-emerald-500/5' },
  closed: { column: 'border-blue-500/30 bg-[linear-gradient(180deg,rgba(59,130,246,0.10),rgba(15,18,30,0.96))]', chip: 'bg-blue-500/12 text-blue-300 border-blue-500/25', accent: 'from-blue-400/40 to-blue-500/5' },
  lost: { column: 'border-rose-500/30 bg-[linear-gradient(180deg,rgba(244,63,94,0.10),rgba(25,15,18,0.96))]', chip: 'bg-rose-500/12 text-rose-300 border-rose-500/25', accent: 'from-rose-400/40 to-rose-500/5' },
}

interface Deal {
  id: number
  title: string
  stage: string
  value: number
  commission: number
  client_name: string
  property_title: string
  agent_name: string
  notes: string
  created_at: string
}

const formatLakhs = (value?: number) => value ? `Rs ${(value / 100000).toFixed(1)}L` : 'Rs 0.0L'

export default function Deals() {
  const [kanban, setKanban] = useState<Record<string, Deal[]>>({})
  const [clients, setClients] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [movingId, setMovingId] = useState<number | null>(null)
  const { register, handleSubmit, reset } = useForm<any>()

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const [kb, cl, pr, ag] = await Promise.all([
        api.get('/deals/kanban'),
        api.get('/clients'),
        api.get('/properties'),
        api.get('/auth/agents'),
      ])
      setKanban(kb.data)
      setClients(cl.data)
      setProperties(pr.data)
      setAgents(ag.data)
    } catch (err: any) {
      const message = err.response?.data?.error || 'The deal pipeline is still loading from the shared demo database.'
      setKanban({})
      setClients([])
      setProperties([])
      setAgents([])
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ stage: 'inquiry' })
    setShowModal(true)
  }

  const openEdit = (deal: Deal) => {
    setEditing(deal)
    reset(deal)
    setShowModal(true)
  }

  const onSubmit = async (data: any) => {
    try {
      if (editing) {
        await api.put(`/deals/${editing.id}`, data)
        toast.success('Deal updated')
      } else {
        await api.post('/deals', data)
        toast.success('Deal created')
      }
      setShowModal(false)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const moveStage = async (dealId: number, newStage: string) => {
    setMovingId(dealId)
    try {
      await api.patch(`/deals/${dealId}/stage`, { stage: newStage })
      toast.success(`Moved to ${STAGE_LABELS[newStage]}`)
      load()
    } catch {
      toast.error('Failed to update stage')
    } finally {
      setMovingId(null)
    }
  }

  const deleteDeal = async (id: number) => {
    if (!window.confirm('Delete this deal?')) return
    try {
      await api.delete(`/deals/${id}`)
      toast.success('Deal deleted')
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const flatDeals = useMemo(() => Object.values(kanban).flat(), [kanban])
  const totalDeals = flatDeals.length
  const totalValue = flatDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
  const totalCommission = flatDeals.reduce((sum, deal) => sum + (deal.commission || 0), 0)
  const closedDeals = kanban.closed || []

  const metrics = [
    { label: 'Open Pipeline', value: String(totalDeals), icon: BriefcaseBusiness },
    { label: 'Pipeline Value', value: formatLakhs(totalValue), icon: CircleDollarSign },
    { label: 'Potential Commission', value: `Rs ${(totalCommission / 1000).toFixed(0)}K`, icon: Sparkles },
    { label: 'Closed Wins', value: String(closedDeals.length), icon: Trophy },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Deal Pipeline</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">Visualize movement from inquiry to closure with stronger stage signals.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">
          <Plus size={13} /> Add Deal
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-slate-300">
                <Icon size={14} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/[0.06] bg-[#0f0f1a] px-6 py-16 text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-white">Loading deal pipeline</p>
          <p className="mt-1 text-[12px] text-slate-500">We are pulling clients, properties, agents, and stage data together.</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 px-6 py-16 text-center">
          <p className="text-sm font-medium text-amber-300">Deals are not ready yet</p>
          <p className="mt-2 text-[12px] text-slate-400">{error}</p>
        </div>
      ) : totalDeals === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/[0.08] bg-[#0f0f1a] px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-200">No deals in the pipeline yet</p>
          <p className="mt-2 text-[12px] text-slate-500">Create your first deal and the kanban board will expand automatically as stages fill up.</p>
          <button onClick={openCreate} className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-500">
            <Plus size={13} /> Add First Deal
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-subtle">
          <div className="grid min-w-[1340px] grid-cols-5 gap-4">
            {STAGES.map(stage => {
              const deals = kanban[stage] || []
              const stageValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
              const style = STAGE_STYLES[stage]

              return (
                <section key={stage} className={`flex min-h-[620px] flex-col overflow-hidden rounded-3xl border ${style.column}`}>
                  <div className={`border-b border-white/[0.06] bg-gradient-to-r ${style.accent} px-4 py-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">{STAGE_LABELS[stage]}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{formatLakhs(stageValue)} total</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${style.chip}`}>{deals.length}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 p-3">
                    {deals.map(deal => (
                      <article key={deal.id} className={`group rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.16] ${movingId === deal.id ? 'opacity-50' : ''}`}>
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-[13px] font-semibold text-white">{deal.title}</h4>
                            <p className="mt-1 text-[11px] text-slate-500">{deal.client_name || 'No client linked'}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                            <button onClick={() => openEdit(deal)} className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-white/[0.06] hover:text-slate-100"><Pencil size={11} /></button>
                            <button onClick={() => deleteDeal(deal.id)} className="rounded-lg p-1.5 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-300"><Trash2 size={11} /></button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                              <DollarSign size={11} />
                              Deal Value
                            </div>
                            <p className="mt-2 text-sm font-medium text-white">{formatLakhs(deal.value)}</p>
                            <p className="mt-1 text-[11px] text-slate-500">Commission: Rs {((deal.commission || 0) / 1000).toFixed(0)}K</p>
                          </div>

                          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500">Property</p>
                            <p className="mt-2 truncate text-[12px] text-slate-300">{deal.property_title || 'No property linked'}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{deal.agent_name || 'No agent assigned'}</p>
                          </div>

                          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500">Notes</p>
                            <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-slate-400">{deal.notes || 'No notes yet for this deal.'}</p>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-white/[0.05] pt-3">
                          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                            <ArrowRight size={10} />
                            Move To
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {STAGES.filter(nextStage => nextStage !== stage).map(nextStage => (
                              <button key={nextStage} onClick={() => moveStage(deal.id, nextStage)} className={`rounded-full border px-2 py-1 text-[10px] transition-colors ${STAGE_STYLES[nextStage].chip} hover:bg-white/[0.08]`}>
                                {STAGE_LABELS[nextStage]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}

                    {deals.length === 0 && (
                      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-black/10 px-6 text-center">
                        <p className="text-[12px] font-medium text-slate-300">No deals in {STAGE_LABELS[stage]}</p>
                        <p className="mt-1 text-[11px] text-slate-500">New deals will appear here as the pipeline grows.</p>
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0f0f1a] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f1a] px-6 py-4">
              <h2 className="text-[14px] font-semibold text-white">{editing ? 'Edit Deal' : 'New Deal'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 transition-colors hover:text-slate-200"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Title *</label>
                  <input {...register('title', { required: true })} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Client</label>
                  <select {...register('client_id')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    <option value="">Select client</option>
                    {clients.map(client => <option key={client.id} value={client.id} className="bg-[#0f0f1a]">{client.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Property</label>
                  <select {...register('property_id')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    <option value="">Select property</option>
                    {properties.map(property => <option key={property.id} value={property.id} className="bg-[#0f0f1a]">{property.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Agent</label>
                  <select {...register('agent_id')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    <option value="">Select agent</option>
                    {agents.map(agent => <option key={agent.id} value={agent.id} className="bg-[#0f0f1a]">{agent.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Stage</label>
                  <select {...register('stage')} className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40">
                    {STAGES.map(stage => <option key={stage} value={stage} className="bg-[#0f0f1a] capitalize">{STAGE_LABELS[stage]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Value (INR)</label>
                  <input {...register('value')} type="number" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">Commission (INR)</label>
                  <input {...register('commission')} type="number" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] text-slate-200 outline-none transition-colors focus:border-indigo-500/40" />
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
