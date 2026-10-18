import {
  GraduationCap, Code2, Lightbulb, Target, AppWindow, Monitor, ShoppingCart,
  Wrench, Database, Rocket, Globe, Smartphone, Brain, Shield, Palette, Cpu,
  type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  graduation: GraduationCap, code: Code2, bulb: Lightbulb, target: Target,
  window: AppWindow, monitor: Monitor, cart: ShoppingCart, wrench: Wrench,
  database: Database, rocket: Rocket, globe: Globe, phone: Smartphone,
  brain: Brain, shield: Shield, palette: Palette, cpu: Cpu,
}
export const ICON_NAMES = Object.keys(ICONS)
export const Icon = ({ name, className }: { name: string; className?: string }) => {
  const C = ICONS[name] ?? Code2
  return <C className={className} />
}

export const COLORS: Record<string, { box: string; text: string }> = {
  sky: { box: 'bg-sky-500/10 border-sky-500/20', text: 'text-sky-400' },
  indigo: { box: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400' },
  cyan: { box: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400' },
  emerald: { box: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  orange: { box: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400' },
  pink: { box: 'bg-pink-500/10 border-pink-500/20', text: 'text-pink-400' },
  violet: { box: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400' },
  amber: { box: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
}
export const COLOR_NAMES = Object.keys(COLORS)

export const GithubIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

export const FacebookIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.96.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.6H7.6v3.3h2.8V22h3.1Z" />
  </svg>
)
