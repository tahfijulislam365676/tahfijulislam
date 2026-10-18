import { motion } from 'framer-motion'
import { ArrowRight, Download, Code2, Sparkles } from 'lucide-react'
import { useData } from '../lib/DataContext'

export function Hero() {
  const { data } = useData()
  const p = data?.profile
  const photo = p?.photo || '/tahfijul.png'
  const words = (p?.name || 'MD. TAHFIJUL ISLAM').split(' ')

  return (
    <section id="home" className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 pb-16 pt-28 lg:grid-cols-2">
      <div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Available for work
        </motion.div>

        <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
          className="mb-3 flex items-center gap-2 text-lg font-medium text-violet-300">
          <span className="wave">👋</span> {p?.welcome || 'Welcome to my portfolio'}
        </motion.p>

        <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
          <span className="text-slate-300">I'm </span>
          {words.map((w, i) => (
            <motion.span key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.6 }}
              className={`mr-3 inline-block ${i === words.length - 1 ? 'gradient-text' : ''}`}>
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-4 text-xl font-semibold text-sky-300">{p?.title}</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
          className="mt-4 max-w-xl text-lg leading-relaxed text-slate-400">{p?.tagline}</motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="mt-8 flex flex-wrap gap-3">
          <a href="#project" className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition hover:brightness-110">
            View projects <ArrowRight size={18} />
          </a>
          <a href="#resume" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
            <Download size={18} /> Resume
          </a>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
        className="relative mx-auto h-[26rem] w-full max-w-md sm:h-[34rem] lg:order-first">
        <div className="absolute left-1/2 top-[12%] aspect-square w-[85%] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-600/50 to-blue-500/40 blur-3xl" />
        <div className="absolute left-1/2 top-[10%] aspect-square w-[88%] -translate-x-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-violet-400/30" />
        <div className="absolute left-1/2 top-[20%] aspect-square w-[68%] -translate-x-1/2 rounded-full border border-sky-400/20" />
        <img src={photo} alt={p?.name || 'Profile photo'}
          className="absolute bottom-0 left-1/2 h-full max-w-none -translate-x-1/2 object-contain object-bottom"
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)', maskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)' }} />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}
          className="card absolute left-0 top-16 flex items-center gap-2 px-4 py-2 text-sm text-white">
          <Code2 size={16} className="text-sky-400" /> Full Stack
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }}
          className="card absolute bottom-24 right-0 flex items-center gap-2 px-4 py-2 text-sm text-white">
          <Sparkles size={16} className="text-violet-400" /> React · TypeScript
        </motion.div>
      </motion.div>
    </section>
  )
}
