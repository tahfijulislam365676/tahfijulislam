import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useData } from '../lib/DataContext'

const NAV = [
  ['Home', '#home'], ['About', '#about'], ['Skills', '#skills'], ['Projects', '#project'],
  ['Experience', '#experience'], ['Services', '#services'], ['Resume', '#resume'],
] as const

export function Header() {
  const { data } = useData()
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

  const name = data?.profile.name || 'MD. TAHFIJUL ISLAM'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#home" className="font-brand text-lg tracking-wider text-white sm:text-2xl">
          <span className="gradient-text">{name}</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${active === href ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" className="btn-primary rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110">
            Contact
          </a>
          <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}
            className="rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#050816]/95 px-5 py-3 backdrop-blur-xl lg:hidden">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
