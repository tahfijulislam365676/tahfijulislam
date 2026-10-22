import { useEffect, useState } from 'react'
import { Languages, Menu, X } from 'lucide-react'
import { useData } from '../lib/DataContext'
import { useLang, type TKey } from '../lib/i18n'

const NAV: [TKey, string][] = [
  ['nav.home', '#home'], ['nav.about', '#about'], ['nav.skills', '#skills'], ['nav.projects', '#project'],
  ['nav.experience', '#experience'], ['nav.services', '#services'], ['nav.resume', '#resume'],
]

export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useLang()
  return (
    <div role="group" aria-label={t('lang.switch')} className={`inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1 ${className}`}>
      <Languages size={15} className="mx-1.5 text-slate-400" aria-hidden="true" />
      {(['en', 'bn'] as const).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`rounded-lg px-2.5 py-1 text-sm font-semibold transition ${lang === l ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          {l === 'en' ? 'EN' : 'বাং'}
        </button>
      ))}
    </div>
  )
}

export function Header() {
  const { data } = useData()
  const { t, pick } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      let current = '#home'
      for (const [, id] of NAV) {
        const el = document.querySelector(id)
        if (el && el.getBoundingClientRect().top <= 140) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const name = data ? pick(data.profile, 'name') : 'MD. TAHFIJUL ISLAM'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <a href="#home" className="font-brand min-w-0 truncate text-lg tracking-wider text-white sm:text-2xl">
          <span className="gradient-text">{name}</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(([key, href]) => (
            <a key={href} href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${active === href ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LangSwitch />
          <a href="#contact" className="btn-primary hidden rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-block">
            {t('nav.contact')}
          </a>
          <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}
            className="rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#050816]/95 px-5 py-3 backdrop-blur-xl lg:hidden">
          {NAV.map(([key, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white">
              {t(key)}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn-primary mt-2 block rounded-lg px-3 py-2.5 text-center font-semibold text-white">
            {t('nav.contact')}
          </a>
        </nav>
      )}
    </header>
  )
}
