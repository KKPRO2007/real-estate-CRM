import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  Handshake,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/properties', icon: Building2, label: 'Properties' },
  { to: '/clients', icon: UserCheck, label: 'Clients' },
  { to: '/deals', icon: Handshake, label: 'Deals' },
  { to: '/agents', icon: Settings, label: 'Agents' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
]

function NavItems({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <>
      {nav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition-all group ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && isActive && <ChevronRight size={12} className="ml-auto text-indigo-400/70" />}
            </>
          )}
        </NavLink>
      ))}
    </>
  )
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Guest","role":"shared workspace"}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d14] text-slate-200">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#0a0a12] transition-transform duration-300 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[76px]' : 'lg:w-[240px]'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
          {!collapsed && (
            <span className="text-sm font-semibold tracking-wide text-white">
              Prop<span className="text-indigo-400">CRM</span>
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed(prev => !prev)}
              className="hidden text-slate-500 transition-colors hover:text-slate-200 lg:inline-flex"
            >
              {collapsed ? <Menu size={16} /> : <X size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="text-slate-500 transition-colors hover:text-slate-200 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavItems collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl bg-white/[0.03] px-3 py-2">
              <p className="truncate text-xs font-semibold text-white">{user.name || 'Team member'}</p>
              <p className="text-[10px] capitalize text-slate-500">{user.role || 'shared workspace'}</p>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 transition-all hover:bg-red-500/5 hover:text-red-400"
          >
            <LogOut size={14} />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0a0a12]/95 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="hidden w-full max-w-md md:block">
              <input
                type="text"
                placeholder="Search leads, clients, properties..."
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs text-slate-300 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-slate-500 transition-all hover:bg-white/[0.04] hover:text-slate-200">
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400" />
            </button>
            <div className="flex items-center gap-2 border-l border-white/[0.06] pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-200">{user.name || 'User'}</p>
                <p className="text-[10px] capitalize text-slate-500">{user.role || 'shared workspace'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#0d0d14] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
