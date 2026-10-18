import { useEffect, useRef, useState } from 'react'
import { Download, FileText, Loader2, Mail, Trash2, UserPlus } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { useData } from '../lib/DataContext'
import { COLORS, Icon, ICON_NAMES } from '../lib/icons'
import type { AboutItem, AuthUser, Experience, Message, Profile, Project, Service, Skill } from '../types'
import { FormFields, type FormValues } from './fields'
import { Manager } from './Manager'

const Thumb = ({ src, text }: { src?: string; text: string }) => (
  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-800/60">
    {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : <span className="font-bold text-slate-500">{text.slice(0, 2)}</span>}
  </div>
)

/* ---------- Overview ---------- */
export function Overview() {
  const { data } = useData()
  const { user } = useAuth()
  const stats: [string, number][] = [
    ['About cards', data?.about.length ?? 0], ['Skills', data?.skills.length ?? 0], ['Projects', data?.projects.length ?? 0],
    ['Experience', data?.experience.length ?? 0], ['Services', data?.services.length ?? 0], ['Resumes', data?.resumes.length ?? 0],
  ]
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400"><span className="h-px w-8 bg-violet-500" /> Your portfolio space</div>
      <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">Manage <span className="gradient-text">everything.</span></h1>
      <p className="mt-3 text-slate-400">Welcome back, {user?.name}. Everything you change here updates the public site instantly.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, n]) => (
          <div key={label} className="card p-6">
            <div className="text-slate-400">{label}</div>
            <div className="mt-2 font-display text-4xl font-extrabold text-white">{String(n).padStart(2, '0')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Profile / Home ---------- */
export function ProfilePage() {
  const { data, reload } = useData()
  const [values, setValues] = useState<FormValues>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  useEffect(() => { if (data) setValues({ ...(data.profile as unknown as FormValues) }) }, [data])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    try { await api.put<Profile>('/profile', values); await reload(); setMsg('Saved ✓') }
    catch (err) { setMsg(err instanceof Error ? err.message : 'Failed') }
    finally { setBusy(false) }
  }
  return (
    <form onSubmit={save} className="card max-w-2xl p-6">
      <h2 className="mb-6 font-display text-2xl font-bold text-white">Home & contact info</h2>
      <FormFields set={(n, v) => setValues((s) => ({ ...s, [n]: v }))} values={values} fields={[
        { name: 'photo', label: 'Profile photo', type: 'image', hint: 'Leave empty to use the default photo.' },
        { name: 'name', label: 'Name (shown in header)', type: 'text', required: true },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'welcome', label: 'Welcome message', type: 'text' },
        { name: 'tagline', label: 'Short intro', type: 'textarea' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'whatsapp', label: 'WhatsApp number', type: 'text', placeholder: '+8801XXXXXXXXX' },
        { name: 'phone', label: 'Phone number', type: 'text', placeholder: '+8801XXXXXXXXX' },
        { name: 'location', label: 'Location', type: 'text', placeholder: 'Bangladesh' },
        { name: 'github', label: 'GitHub URL', type: 'url' },
        { name: 'facebook', label: 'Facebook URL', type: 'url' },
      ]} />
      <div className="mt-6 flex items-center gap-4">
        <button disabled={busy} className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-60">{busy && <Loader2 size={16} className="animate-spin" />} Save changes</button>
        {msg && <span className="text-sm text-slate-300">{msg}</span>}
      </div>
    </form>
  )
}

/* ---------- Collections ---------- */
export const AboutPage = () => (
  <Manager<AboutItem> collection="about" title="About cards" singular="card"
    empty={{ icon: 'code', title: '', text: '' }}
    fields={[
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'text', label: 'Text', type: 'textarea', required: true },
    ]}
    render={(i) => <div className="flex items-center gap-4"><Icon name={i.icon} className="h-5 w-5 shrink-0 text-sky-400" /><div className="min-w-0"><div className="font-semibold text-white">{i.title}</div><div className="truncate text-sm text-slate-400">{i.text}</div></div></div>} />
)

export const SkillsPage = () => (
  <Manager<Skill> collection="skills" title="Skills" singular="skill"
    empty={{ name: '', category: 'Programming language', level: 'Intermediate', logo: '' }}
    fields={[
      { name: 'logo', label: 'Logo', type: 'image', hint: 'PNG, JPG, WEBP or SVG, up to 5MB.' },
      { name: 'name', label: 'Skill name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', placeholder: 'Programming language' },
      { name: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    ]}
    render={(s) => <div className="flex items-center gap-4"><Thumb src={s.logo} text={s.name} /><div><div className="font-semibold text-white">{s.name}</div><div className="text-sm text-slate-400">{s.category} · {s.level}</div></div></div>} />
)

export const ProjectsPage = () => (
  <Manager<Project> collection="projects" title="Projects" singular="project"
    empty={{ title: '', description: '', status: 'Completed', tags: [], image: '', liveUrl: '', githubUrl: '' }}
    fields={[
      { name: 'image', label: 'Screenshot', type: 'image' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['Completed', 'In progress', 'Planned'] },
      { name: 'tags', label: 'Technologies', type: 'list', hint: 'One per line, e.g. HTML' },
      { name: 'liveUrl', label: 'Live demo URL', type: 'url' },
      { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
    ]}
    render={(p) => <div className="flex items-center gap-4"><Thumb src={p.image} text={p.title} /><div className="min-w-0"><div className="font-semibold text-white">{p.title}</div><div className="truncate text-sm text-slate-400">{p.status} · {p.tags.join(', ')}</div></div></div>} />
)

export const ExperiencePage = () => (
  <Manager<Experience> collection="experience" title="Experience" singular="experience"
    empty={{ period: '', current: false, title: '', company: '', description: '', points: [], tags: [] }}
    fields={[
      { name: 'title', label: 'Job title', type: 'text', required: true },
      { name: 'company', label: 'Company / type', type: 'text' },
      { name: 'period', label: 'Period', type: 'text', placeholder: 'January 2026 to present' },
      { name: 'current', label: '', type: 'checkbox', placeholder: 'This is my current role' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'points', label: 'Highlights', type: 'list', hint: 'One per line' },
      { name: 'tags', label: 'Technologies', type: 'list', hint: 'One per line' },
    ]}
    render={(e) => <div><div className="font-semibold text-white">{e.title} {e.current && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">Current</span>}</div><div className="text-sm text-slate-400">{e.company} · {e.period}</div></div>} />
)

export const ServicesPage = () => (
  <Manager<Service> collection="services" title="Services" singular="service"
    empty={{ icon: 'code', color: 'sky', title: '', description: '', points: [] }}
    fields={[
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'color', label: 'Color', type: 'color' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'points', label: 'Bullet points', type: 'list', hint: 'One per line' },
    ]}
    render={(s) => { const c = COLORS[s.color] ?? COLORS.sky; return <div className="flex items-center gap-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${c.box}`}><Icon name={ICON_NAMES.includes(s.icon) ? s.icon : 'code'} className={`h-5 w-5 ${c.text}`} /></div><div className="min-w-0"><div className="font-semibold text-white">{s.title}</div><div className="truncate text-sm text-slate-400">{s.description}</div></div></div> }} />
)

/* ---------- Resume ---------- */
export function ResumePage() {
  const { data, reload } = useData()
  const ref = useRef<HTMLInputElement>(null)
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function upload(file?: File) {
    if (!file) return
    setBusy(true); setError('')
    try {
      const fd = new FormData()
      fd.append('label', label)
      fd.append('file', file)
      await api.upload('/resumes', fd)
      setLabel(''); await reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed') }
    finally { setBusy(false); if (ref.current) ref.current.value = '' }
  }
  async function remove(id: string) {
    if (!window.confirm('Delete this resume file?')) return
    await api.del(`/resumes/${id}`); await reload()
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-2xl font-bold text-white">Resume / CV</h2>
      <p className="mb-6 text-sm text-slate-400">Upload one or more files (PDF, DOC, DOCX up to 15MB). Delete old ones any time.</p>
      <div className="card mb-6 flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-[14rem] flex-1">
          <label className="mb-2 block text-sm text-slate-300">Label (optional)</label>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Resume 2026 (page 1)" />
        </div>
        <button onClick={() => ref.current?.click()} disabled={busy} className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="rotate-180" />} Upload file
        </button>
        <input ref={ref} type="file" hidden accept=".pdf,.doc,.docx,application/pdf" onChange={(e) => upload(e.target.files?.[0])} />
        {error && <p className="w-full text-sm text-red-300">{error}</p>}
      </div>
      <div className="space-y-3">
        {(data?.resumes ?? []).length === 0 && <div className="card p-10 text-center text-slate-400">No resume uploaded yet.</div>}
        {data?.resumes.map((r) => (
          <div key={r.id} className="card flex items-center justify-between gap-4 p-4">
            <a href={r.file} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-4 hover:opacity-80">
              <FileText className="shrink-0 text-violet-400" />
              <div className="min-w-0"><div className="truncate font-semibold text-white">{r.label}</div><div className="truncate text-sm text-slate-400">{r.originalName}</div></div>
            </a>
            <button onClick={() => remove(r.id)} aria-label="Delete" className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={17} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Users (owner) ---------- */
export function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const load = () => api.get<AuthUser[]>('/users').then(setUsers).catch(() => {})
  useEffect(() => { void load() }, [])

  if (user?.role !== 'owner') return <div className="card p-10 text-center text-slate-400">Only the owner can manage users.</div>

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try { await api.post('/users', form); setForm({ name: '', email: '', password: '' }); await load() }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setBusy(false) }
  }
  async function remove(u: AuthUser) {
    if (!window.confirm(`Remove access for ${u.email}?`)) return
    await api.del(`/users/${u.id}`); await load()
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-2xl font-bold text-white">Dashboard users</h2>
      <p className="mb-6 text-sm text-slate-400">Editors can manage portfolio content. Only you (the owner) can add or remove users.</p>
      <form onSubmit={add} className="card mb-6 grid gap-4 p-5 sm:grid-cols-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password (min 8)" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <div className="sm:col-span-3 flex items-center gap-4">
          <button disabled={busy} className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-60"><UserPlus size={16} /> Give access</button>
          {error && <span className="text-sm text-red-300">{error}</span>}
        </div>
      </form>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="card flex items-center justify-between gap-4 p-4">
            <div><div className="font-semibold text-white">{u.name} <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${u.role === 'owner' ? 'bg-violet-500/20 text-violet-300' : 'bg-sky-500/15 text-sky-300'}`}>{u.role}</span></div><div className="text-sm text-slate-400">{u.email}</div></div>
            {u.role !== 'owner' && <button onClick={() => remove(u)} aria-label="Remove" className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={17} /></button>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Password ---------- */
export function PasswordPage() {
  const [v, setV] = useState({ current: '', next: '' })
  const [msg, setMsg] = useState('')
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    try { await api.post('/auth/password', v); setV({ current: '', next: '' }); setMsg('Password changed ✓') }
    catch (err) { setMsg(err instanceof Error ? err.message : 'Failed') }
  }
  return (
    <form onSubmit={save} className="card max-w-md p-6">
      <h2 className="mb-6 font-display text-2xl font-bold text-white">Change password</h2>
      <div className="space-y-4">
        <input className="input" type="password" placeholder="Current password" value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} required />
        <input className="input" type="password" placeholder="New password (min 8)" minLength={8} value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} required />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button className="btn-primary rounded-xl px-6 py-2.5 font-semibold text-white">Update</button>
        {msg && <span className="text-sm text-slate-300">{msg}</span>}
      </div>
    </form>
  )
}

/* ---------- Messages ---------- */
export function MessagesPage() {
  const [items, setItems] = useState<Message[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const load = () => api.get<Message[]>('/messages').then(setItems).finally(() => setLoading(false))
  useEffect(() => { void load() }, [])

  async function toggle(m: Message) {
    setOpen(open === m.id ? null : m.id)
    if (!m.read) { await api.put(`/messages/${m.id}/read`, {}); setItems((l) => l.map((x) => x.id === m.id ? { ...x, read: true } : x)) }
  }
  async function remove(m: Message) {
    if (!window.confirm('Delete this message?')) return
    await api.del(`/messages/${m.id}`); await load()
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl text-white">Messages</h2>
      <p className="mb-6 text-sm text-slate-400">Messages sent from the contact form on your site.</p>
      {loading ? <div className="card p-10 text-center text-slate-400">Loading…</div> : items.length === 0 ? <div className="card p-10 text-center text-slate-400">No messages yet.</div> : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className={`card p-4 ${m.read ? '' : 'border-sky-500/40'}`}>
              <div className="flex items-center justify-between gap-4">
                <button onClick={() => toggle(m)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-400" />}
                    <span className="truncate">{m.subject || '(no subject)'}</span>
                  </div>
                  <div className="truncate text-sm text-slate-400">{m.name} · {m.email} · {new Date(m.createdAt).toLocaleString()}</div>
                </button>
                <button onClick={() => remove(m)} aria-label="Delete" className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={17} /></button>
              </div>
              {open === m.id && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="whitespace-pre-wrap break-words text-slate-200">{m.message}</p>
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || ''))}`} className="btn-primary mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white"><Mail size={15} /> Reply</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
