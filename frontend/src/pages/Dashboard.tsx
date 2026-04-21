import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api'
import { TrendingUp, Users, Building2, Handshake, ArrowUpRight } from 'lucide-react'

const STAGE_COLORS: Record<string, string> = {
  inquiry: '#6366f1',
  negotiation: '#f59e0b',
  agreement: '#10b981',
  closed: '#3b82f6',
  lost: '#ef4444',
}

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [leadStats, setLeadStats] = useState<any>(null)
  const [dealStats, setDealStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/agents/reports/overview'),
      api.get('/leads/stats'),
      api.get('/deals/stats'),
    ])
      .then(([overviewRes, leadsRes, dealsRes]) => {
        setOverview(overviewRes.data)
        setLeadStats(leadsRes.data)
        setDealStats(dealsRes.data)
      })
      .catch((err: any) => {
        setError(err.response?.data?.error || 'Demo data is still waking up. Please wait a moment and refresh.')
      })
      .finally(() => setLoading(false))
  }, [])

  const monthlyRevenueData = useMemo(
    () => (overview?.monthlyDeals || []).filter((item: any) => item && item.month && Number(item.revenue || 0) > 0),
    [overview],
  )

  const leadSourceData = useMemo(
    () => (leadStats?.bySource || []).filter((item: any) => item?.source && Number(item.count || 0) > 0),
    [leadStats],
  )

  const stageData = useMemo(
    () => (dealStats?.byStage || []).filter((item: any) => Number(item.count || 0) > 0),
    [dealStats],
  )

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0f0f1a] px-8 py-10 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-white">Loading dashboard</p>
          <p className="mt-1 text-[12px] text-slate-500">The demo database may take a few seconds to respond on first open.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-amber-300">Dashboard is temporarily unavailable</p>
        <p className="mt-2 text-[12px] text-slate-400">{error}</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Leads', value: leadStats?.total ?? 0, icon: Users, sub: `+${leadStats?.thisWeek ?? 0} this week`, color: 'indigo' },
    { label: 'Properties', value: overview?.propertyStats?.reduce((a: number, b: any) => a + b.count, 0) ?? 0, icon: Building2, sub: 'Total listed', color: 'emerald' },
    { label: 'Active Deals', value: dealStats?.total ?? 0, icon: Handshake, sub: `${dealStats?.closed ?? 0} closed`, color: 'amber' },
    { label: 'Revenue', value: `Rs ${((dealStats?.totalRevenue ?? 0) / 100000).toFixed(1)}L`, icon: TrendingUp, sub: `Commissions: Rs ${((dealStats?.totalCommission ?? 0) / 1000).toFixed(0)}K`, color: 'violet' },
  ]

  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <p className="mt-0.5 text-[12px] text-slate-500">Overview of your CRM activity</p>
        </div>
        <span className="w-fit rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, sub, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-[#0f0f1a] p-4 transition-colors hover:border-white/10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
              <div className={`rounded-lg border p-1.5 ${colorMap[color]}`}>
                <Icon size={12} />
              </div>
            </div>
            <p className="mb-1 text-2xl font-semibold text-white">{value}</p>
            <p className="flex items-center gap-1 text-[11px] text-slate-500"><ArrowUpRight size={10} className="text-emerald-400" />{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f1a] p-5 xl:col-span-2">
          <h3 className="mb-4 text-[12px] font-medium text-slate-300">Monthly Revenue</h3>
          {monthlyRevenueData.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 text-center">
              <div>
                <p className="text-[13px] font-medium text-slate-300">No revenue data yet</p>
                <p className="mt-1 text-[11px] text-slate-500">Close a few deals and monthly revenue will appear here.</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={value => `Rs ${(Number(value) / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' }} formatter={(value: number) => [`Rs ${(value / 1000).toFixed(1)}K`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={1.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f1a] p-5">
          <h3 className="mb-4 text-[12px] font-medium text-slate-300">Deal Stages</h3>
          {stageData.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 text-center">
              <div>
                <p className="text-[13px] font-medium text-slate-300">No deals yet</p>
                <p className="mt-1 text-[11px] text-slate-500">Pipeline distribution appears here after deal creation.</p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={stageData} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={40} outerRadius={62} strokeWidth={0}>
                    {stageData.map((entry: any) => (
                      <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {stageData.map((stage: any) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: STAGE_COLORS[stage.stage] }} />
                      <span className="text-[11px] capitalize text-slate-400">{stage.stage}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">{stage.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f1a] p-5">
          <h3 className="mb-4 text-[12px] font-medium text-slate-300">Lead Sources</h3>
          {leadSourceData.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 text-center">
              <div>
                <p className="text-[13px] font-medium text-slate-300">No lead source data yet</p>
                <p className="mt-1 text-[11px] text-slate-500">Add leads with sources like website, referral, or google to populate this chart.</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leadSourceData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} width={78} />
                <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f1a] p-5">
          <h3 className="mb-4 text-[12px] font-medium text-slate-300">Top Agents</h3>
          <div className="space-y-3">
            {(overview?.topAgents || []).map((agent: any, index: number) => (
              <div key={agent.name} className="flex items-center gap-3">
                <span className="w-4 text-[10px] text-slate-600">{index + 1}</span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-semibold text-indigo-300">
                  {agent.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] text-slate-300">{agent.name}</span>
                    <span className="text-[11px] text-slate-500">{agent.deals} deals</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min((agent.deals / (overview?.topAgents?.[0]?.deals || 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {(!overview?.topAgents || overview.topAgents.length === 0) && (
              <p className="py-4 text-center text-[12px] text-slate-600">No closed deals yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
