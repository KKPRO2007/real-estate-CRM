import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api'
import { Plus, Search, Pencil, Trash2, X, Phone, Mail, ChevronDown } from 'lucide-react'

const TYPES = ['buyer', 'seller', 'both']
const TYPE_COLORS: Record<string, string> = { buyer: 'bg-blue-500/10 text-blue-300 border-blue-500/20', seller: 'bg-violet-500/10 text-violet-300 border-violet-500/20', both: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }

interface Client { id: number; name: string; email: string; phone: string; type: string; preferences: any; created_at: string }

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { register, handleSubmit, reset } = useForm<any>()

  const load = async () => {
    const params: any = {}
    if (search) params.search = search
    if (typeFilter) params.type = typeFilter
    const res = await api.get('/clients', { params })
    setClients(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [search, typeFilter])

  const openCreate = () => { setEditing(null); reset({}); setShowModal(true) }
  const openEdit = (c: Client) => { setEditing(c); reset({ ...c, preferences: JSON.stringify(c.preferences || {}) }); setShowModal(true) }

  const onSubmit = async (data: any) => {
    let preferences = {}
    try { preferences = JSON.parse(data.preferences || '{}') } catch { preferences = {} }
    const payload = { ...data, preferences }
    try {
      if (editing) { await api.put(`/clients/${editing.id}`, payload); toast.success('Client updated') }
      else { await api.post('/clients', payload); toast.success('Client created') }
      setShowModal(false); load()
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error') }
  }

  const deleteClient = async (id: number) => {
    if (!confirm('Delete this client?')) return
    await api.delete(`/clients/${id}`); toast.success('Client deleted'); load()
  }

  const initials = (name: string) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const avatarColors = ['bg-indigo-500/20 text-indigo-300', 'bg-emerald-500/20 text-emerald-300', 'bg-amber-500/20 text-amber-300', 'bg-violet-500/20 text-violet-300', 'bg-rose-500/20 text-rose-300']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Clients</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">{clients.length} total clients</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={13} /> Add Client
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.07] rounded-lg text-[12px] text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/40 transition-colors" />
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="appearance-none bg-white/[0.04] border border-white/[0.07] rounded-lg pl-3 pr-8 py-2 text-[12px] text-slate-300 outline-none focus:border-indigo-500/40 transition-colors cursor-pointer">
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t} className="bg-[#0f0f1a] capitalize">{t}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 flex justify-center py-16"><div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>
        ) : clients.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-600 text-[13px]">No clients found</div>
        ) : clients.map((c, i) => (
          <div key={c.id} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-colors group">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-medium text-slate-200 truncate">{c.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[c.type] || ''}`}>{c.type}</span>
                </div>
                <div className="mt-2 space-y-1">
                  {c.email && <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Mail size={10} /><span className="truncate">{c.email}</span></div>}
                  {c.phone && <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><Phone size={10} />{c.phone}</div>}
                </div>
                {c.preferences && Object.keys(c.preferences).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(c.preferences).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="text-[10px] px-1.5 py-0.5 bg-white/[0.03] border border-white/[0.05] rounded text-slate-600">{k}: {String(v)}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
              <span className="text-[11px] text-slate-600">{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"><Pencil size={11} /></button>
                <button onClick={() => deleteClient(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"><Trash2 size={11} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-[14px] font-semibold text-white">{editing ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-200 transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {[['name', 'Name *', 'text', true], ['email', 'Email', 'email', false], ['phone', 'Phone', 'text', false]].map(([field, label, type, required]: any) => (
                <div key={field}>
                  <label className="block text-[11px] text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input {...register(field, { required: required ? 'Required' : false })} type={type} className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/40 transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
                <select {...register('type')} className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/40 transition-colors">
                  {TYPES.map(t => <option key={t} value={t} className="bg-[#0f0f1a] capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1.5 uppercase tracking-wider">Preferences (JSON)</label>
                <textarea {...register('preferences')} rows={2} placeholder='{"budget": "50L", "location": "Noida"}' className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-slate-200 outline-none focus:border-indigo-500/40 transition-colors resize-none font-mono" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-slate-300 text-[12px] font-medium py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium py-2 rounded-lg transition-colors">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}