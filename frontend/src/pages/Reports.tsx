import { useEffect, useState } from 'react'
import { BarChart3, Download, TrendingUp, Users, Handshake } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api'

interface LeadStats {
  total: number
  thisWeek: number
  bySource: Array<{ source: string; count: number }>
}

interface DealStats {
  total: number
  closed: number
  totalRevenue: number
  totalCommission: number
  byStage: Array<{ stage: string; count: number }>
  agentPerf: Array<{ name: string; deal_count: number; total_commission: number }>
}

export default function Reports() {
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
  const [dealStats, setDealStats] = useState<DealStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/leads/stats'), api.get('/deals/stats')])
      .then(([leadsRes, dealsRes]) => {
        setLeadStats(leadsRes.data)
        setDealStats(dealsRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const kpis = [
    { label: 'Lead Conversion', value: `${leadStats && dealStats && leadStats.total ? ((dealStats.closed / leadStats.total) * 100).toFixed(1) : '0'}%`, icon: TrendingUp },
    { label: 'Revenue', value: `Rs ${((dealStats?.totalRevenue || 0) / 100000).toFixed(1)}L`, icon: BarChart3 },
    { label: 'Commission', value: `Rs ${((dealStats?.totalCommission || 0) / 1000).toFixed(0)}K`, icon: Handshake },
    { label: 'New This Week', value: String(leadStats?.thisWeek || 0), icon: Users },
  ]

  const leadSourceData = (leadStats?.bySource || []).filter(item => item.source)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Reports & Analytics</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">Track conversions, revenue, and team performance.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[12px] text-slate-300 transition-colors hover:bg-white/[0.06]">
          <Download size={14} />
          Export Snapshot
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-300">
                <Icon size={14} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-5">
          <h3 className="mb-4 text-sm font-medium text-slate-200">Lead Sources</h3>
          {loading ? (
            <div className="flex h-64 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
          ) : leadSourceData.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 text-center">
              <p className="text-[13px] font-medium text-slate-300">No lead source data yet</p>
              <p className="mt-1 text-[11px] text-slate-500">Create a few leads and this chart will populate automatically.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={leadSourceData}>
                <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-5">
          <h3 className="mb-4 text-sm font-medium text-slate-200">Top Closers</h3>
          <div className="space-y-3">
            {(dealStats?.agentPerf || []).map((agent, index) => (
              <div key={`${agent.name}-${index}`} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-slate-100">{agent.name || 'Unassigned'}</p>
                    <p className="text-[11px] text-slate-500">{agent.deal_count} closed deals</p>
                  </div>
                  <p className="text-[12px] font-medium text-indigo-300">Rs {((agent.total_commission || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>
            ))}
            {(!dealStats?.agentPerf || dealStats.agentPerf.length === 0) && (
              <p className="py-8 text-center text-[12px] text-slate-600">No closed deals yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
