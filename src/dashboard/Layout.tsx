import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Briefcase, Inbox, FileText, FolderKanban, Home, KeyRound, LayoutDashboard, LogOut, Sparkles, UserRound, Users, Wrench, Check, ExternalLink } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'Home & contact', icon: Home },
  { to: '/admin/about', label: 'About', icon: UserRound },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/services', label: 'Services', icon: Wrench },
  { to: '/admin/resume', label: 'Resume', icon: FileText },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/password', label: 'Password', icon: KeyRound },
]

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const nav = useNavigate()
  if (loading) return <div className="page-bg flex min-h-screen items-center justify-center text-slate-400">Loading…</div>
  if (!user) return <Navigate to="/admin/login" replace />
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="page-bg min-h-screen">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-6 p-4 lg:flex-row lg:p-8">
        <aside className="card shrink-0 p-5 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-72">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-900/40"><Check className="text-white" /></div>
            <div>
              <div className="font-display text-xl font-bold text-white">Dashboard</div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Portfolio</div>
            </div>
          </div>
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Manage</div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.filter((n) => n.to !== '/admin/users' || user.role === 'owner').map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${isActive ? 'border-violet-500/40 bg-violet-500/15 text-white' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <n.icon size={18} /> {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Dashboard / Manage</div>
            <div className="flex items-center gap-3">
              <a href="/" target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 sm:inline-flex"><span className="h-2 w-2 rounded-full bg-emerald-400" /> View site <ExternalLink size={13} /></a>
              <button onClick={() => { logout(); nav('/admin/login') }} title="Log out" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"><LogOut size={15} /> Log out</button>
              <div title={user.email} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white">{initials}</div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
