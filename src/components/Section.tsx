import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Section({ id, eyebrow, title, subtitle, children }: {
  id: string; eyebrow: string; title: string; subtitle?: string; children: ReactNode
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
          <span className="h-px w-8 bg-violet-500" /> {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 max-w-2xl text-slate-400">{subtitle}</p>}
      </motion.div>
      {children}
    </section>
  )
}

export const Empty = ({ text }: { text: string }) => (
  <div className="card p-10 text-center text-slate-400">{text}</div>
)
