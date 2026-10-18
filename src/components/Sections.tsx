import { useState } from 'react'
import type React from 'react'
import { motion } from 'framer-motion'
import { Check, Download, ExternalLink, Eye, FileText, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { api } from '../lib/api'
import { useData } from '../lib/DataContext'
import { COLORS, FacebookIcon, GithubIcon, Icon } from '../lib/icons'
import { Empty, Section } from './Section'

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay: Math.min(i * 0.08, 0.4) },
})

/* ---------- About ---------- */
export function About() {
  const { data } = useData()
  const items = data?.about ?? []
  const tones = ['sky', 'indigo', 'cyan', 'emerald', 'violet', 'pink']
  return (
    <Section id="about" eyebrow="About me" title="Who I am" subtitle="A short look at what drives me as a developer.">
      {items.length === 0 ? <Empty text="Nothing here yet." /> : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((it, i) => {
            const c = COLORS[tones[i % tones.length]]
            return (
              <motion.article key={it.id} {...fade(i)} className="card p-7 transition hover:-translate-y-1 hover:border-violet-500/40">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${c.box}`}>
                  <Icon name={it.icon} className={`h-5 w-5 ${c.text}`} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{it.title}</h3>
                <p className="leading-relaxed text-slate-400">{it.text}</p>
              </motion.article>
            )
          })}
        </div>
      )}
    </Section>
  )
}

/* ---------- Skills ---------- */
const LEVEL: Record<string, string> = {
  Beginner: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  Intermediate: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  Advanced: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  Expert: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
}

export function Skills() {
  const { data } = useData()
  const items = data?.skills ?? []
  return (
    <Section id="skills" eyebrow="Skills" title="Technologies I work with" subtitle="Languages and tools I use to build things.">
      {items.length === 0 ? <Empty text="No skills added yet." /> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <motion.div key={s.id} {...fade(i)} className="card flex flex-col items-center p-6 text-center transition hover:-translate-y-1 hover:border-sky-500/40">
              <div className="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-800/60">
                {s.logo
                  ? <img src={s.logo} alt={`${s.name} logo`} loading="lazy" className="h-14 w-14 object-contain" />
                  : <span className="font-display text-3xl font-extrabold text-slate-500">{s.name.slice(0, 2)}</span>}
              </div>
              <h3 className="text-lg font-semibold text-white">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.category}</p>
              <span className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${LEVEL[s.level] ?? LEVEL.Intermediate}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.level}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ---------- Projects ---------- */
const STATUS: Record<string, string> = {
  Completed: 'bg-emerald-500 text-white',
  'In progress': 'bg-orange-500 text-white',
  Planned: 'bg-slate-500 text-white',
}
const TAG = ['border-orange-500/30 bg-orange-500/10 text-orange-300', 'border-sky-500/30 bg-sky-500/10 text-sky-300', 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300', 'border-violet-500/30 bg-violet-500/10 text-violet-300', 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300']

export function Projects() {
  const { data } = useData()
  const items = data?.projects ?? []
  return (
    <Section id="project" eyebrow="Projects" title="Things I've built" subtitle="A selection of my recent work.">
      {items.length === 0 ? <Empty text="No projects added yet." /> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <motion.article key={p.id} {...fade(i)} className="card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-violet-500/40">
              <div className="relative aspect-video bg-slate-800/70">
                {p.image
                  ? <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center font-display text-2xl font-bold text-slate-600">{p.title}</div>}
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${STATUS[p.status] ?? STATUS.Completed}`}>{p.status}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-white">{p.title}</h3>
                <p className="mt-2 flex-1 leading-relaxed text-slate-400">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-4">
                  {p.tags.map((t, j) => <span key={t} className={`rounded-md border px-2.5 py-1 text-xs ${TAG[j % TAG.length]}`}>{t}</span>)}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {p.liveUrl
                    ? <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"><ExternalLink size={15} /> Live demo</a>
                    : <span className="inline-flex items-center justify-center rounded-xl bg-slate-700/40 py-2.5 text-sm text-slate-500">No demo yet</span>}
                  {p.githubUrl
                    ? <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"><GithubIcon size={15} /> GitHub</a>
                    : <span className="inline-flex items-center justify-center rounded-xl bg-slate-700/40 py-2.5 text-sm text-slate-500">Private</span>}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ---------- Experience ---------- */
export function Experience() {
  const { data } = useData()
  const items = data?.experience ?? []
  return (
    <Section id="experience" eyebrow="Experience" title="My journey so far">
      {items.length === 0 ? <Empty text="No experience added yet." /> : (
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-sky-500 via-violet-500 to-transparent md:left-1/2" />
          <div className="space-y-10">
            {items.map((e, i) => {
              const left = i % 2 === 0
              return (
                <div key={e.id} className="relative md:grid md:grid-cols-2 md:gap-14">
                  <span className={`absolute left-4 top-8 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4 ring-[#050816] md:left-1/2 ${e.current ? 'bg-sky-400' : 'bg-violet-500'}`} />
                  <motion.div {...fade(0)} className={`card ml-10 p-7 md:ml-0 ${left ? '' : 'md:col-start-2'} ${e.current ? 'border-sky-500/40' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`text-sm font-semibold ${e.current ? 'text-sky-400' : 'text-violet-400'}`}>{e.period}</span>
                      {e.current && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-300">Current</span>}
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-white">{e.title}</h3>
                    <p className="font-medium text-slate-200">{e.company}</p>
                    <p className="mt-3 leading-relaxed text-slate-400">{e.description}</p>
                    {e.points.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {e.points.map((pt) => <li key={pt} className="flex gap-2 text-sm text-slate-400"><Check size={16} className="mt-0.5 shrink-0 text-sky-400" />{pt}</li>)}
                      </ul>
                    )}
                    {e.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {e.tags.map((t) => <span key={t} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200">{t}</span>)}
                      </div>
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Section>
  )
}

/* ---------- Services ---------- */
export function Services() {
  const { data } = useData()
  const items = data?.services ?? []
  return (
    <Section id="services" eyebrow="Services" title="How I can help" subtitle="Services I offer to clients and teams.">
      {items.length === 0 ? <Empty text="No services added yet." /> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => {
            const c = COLORS[s.color] ?? COLORS.sky
            return (
              <motion.article key={s.id} {...fade(i)} className="card p-7 transition hover:-translate-y-1 hover:border-violet-500/40">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl border ${c.box}`}>
                  <Icon name={s.icon} className={`h-6 w-6 ${c.text}`} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{s.title}</h3>
                <p className="leading-relaxed text-slate-400">{s.description}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((pt) => <li key={pt} className="flex items-center gap-2 text-sm text-slate-300"><Check size={16} className={c.text} />{pt}</li>)}
                </ul>
              </motion.article>
            )
          })}
        </div>
      )}
    </Section>
  )
}

/* ---------- Resume ---------- */
const mb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)

export function ResumeSection() {
  const { data } = useData()
  const items = data?.resumes ?? []
  return (
    <Section id="resume" eyebrow="Resume" title="My CV" subtitle="View it online or download a copy.">
      {items.length === 0 ? <Empty text="No resume has been uploaded yet." /> : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((r, i) => (
            <motion.div key={r.id} {...fade(i)} className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10"><FileText className="text-violet-400" /></div>
                <div>
                  <h3 className="font-semibold text-white">{r.label}</h3>
                  <p className="text-sm text-slate-400">{mb(r.size)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={r.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><Eye size={16} /> View</a>
                <a href={r.file} download={r.originalName} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"><Download size={16} /> Download</a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* ---------- Contact / Footer ---------- */
type SendState = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const { data } = useData()
  const p = data?.profile
  const wa = (p?.whatsapp || '').replace(/[^\d]/g, '')
  const phone = p?.phone || p?.whatsapp
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [state, setState] = useState<SendState>('idle')
  const [error, setError] = useState('')

  const details = [
    p?.email && { label: 'Email', value: p.email, href: `mailto:${p.email}`, icon: Mail, tone: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    wa && { label: 'WhatsApp', value: p?.whatsapp, href: `https://wa.me/${wa}`, icon: MessageCircle, tone: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    phone && { label: 'Phone', value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}`, icon: Phone, tone: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    p?.location && { label: 'Location', value: p.location, href: '', icon: MapPin, tone: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: React.ElementType; tone: string }[]

  const socials = [
    p?.github && { href: p.github, label: 'GitHub', icon: GithubIcon },
    p?.facebook && { href: p.facebook, label: 'Facebook', icon: FacebookIcon },
    wa && { href: `https://wa.me/${wa}`, label: 'WhatsApp', icon: MessageCircle },
  ].filter(Boolean) as { href: string; label: string; icon: React.ElementType }[]

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending'); setError('')
    try {
      await api.post('/messages', form)
      setForm({ name: '', email: '', subject: '', message: '', website: '' })
      setState('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  return (
    <>
      <Section id="contact" eyebrow="Contact" title="Get in touch" subtitle="Have a project or an idea? Send me a message and I'll reply as soon as I can.">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div {...fade(0)} className="card flex flex-col p-7 sm:p-10">
            <h3 className="text-2xl text-white">Contact details</h3>
            <ul className="mt-8 space-y-6">
              {details.map((d) => {
                const inner = (
                  <>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${d.tone}`}><d.icon size={22} /></div>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-500">{d.label}</div>
                      <div className="break-words text-lg text-white">{d.value}</div>
                    </div>
                  </>
                )
                return (
                  <li key={d.label}>
                    {d.href
                      ? <a href={d.href} target={d.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-4 transition hover:opacity-80">{inner}</a>
                      : <div className="flex items-center gap-4">{inner}</div>}
                  </li>
                )
              })}
            </ul>
            {socials.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-4 text-slate-500">Find me online</p>
                <div className="flex gap-3">
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                      className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-white/10">
                      <s.icon size={22} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.form {...fade(1)} onSubmit={submit} className="card p-7 sm:p-10">
            <h3 className="text-2xl text-white">Send a message</h3>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="mb-2 block text-sm font-semibold text-slate-200">Name</label>
                <input id="c-name" className="input !py-3.5" placeholder="Your name" value={form.name} onChange={set('name')} maxLength={100} required autoComplete="name" />
              </div>
              <div>
                <label htmlFor="c-email" className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
                <input id="c-email" type="email" className="input !py-3.5" placeholder="you@example.com" value={form.email} onChange={set('email')} maxLength={200} required autoComplete="email" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-subject" className="mb-2 block text-sm font-semibold text-slate-200">Subject</label>
                <input id="c-subject" className="input !py-3.5" placeholder="Project discussion" value={form.subject} onChange={set('subject')} maxLength={150} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-message" className="mb-2 block text-sm font-semibold text-slate-200">Message</label>
                <textarea id="c-message" rows={6} className="input" placeholder="Tell me about your project…" value={form.message} onChange={set('message')} maxLength={3000} required />
              </div>
              {/* honeypot field: hidden from people, bots tend to fill it */}
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" value={form.website} onChange={set('website')} />
            </div>

            {state === 'sent' && <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">Thank you! Your message has been sent. I'll get back to you soon.</p>}
            {state === 'error' && <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

            <button disabled={state === 'sending'}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-4 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:opacity-60">
              {state === 'sending' ? 'Sending…' : 'Send message'} <Send size={18} />
            </button>
          </motion.form>
        </div>
      </Section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {p?.name}. All rights reserved.</span>
          <a href="/admin/login" className="transition hover:text-slate-300">Admin login</a>
        </div>
      </footer>
    </>
  )
}
