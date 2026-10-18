import { useState, type ReactNode } from 'react'
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../lib/api'
import { useData } from '../lib/DataContext'
import type { PortfolioData } from '../types'
import { FormFields, type FieldDef, type FormValues } from './fields'

type Key = 'about' | 'skills' | 'projects' | 'experience' | 'services'

interface Props<T extends { id: string }> {
  collection: Key
  title: string
  singular: string
  fields: FieldDef[]
  empty: FormValues
  render: (item: T) => ReactNode
}

export function Manager<T extends { id: string }>({ collection, title, singular, fields, empty, render }: Props<T>) {
  const { data, reload } = useData()
  const items = ((data as PortfolioData | null)?.[collection] ?? []) as unknown as T[]
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [values, setValues] = useState<FormValues>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function openNew() { setValues({ ...empty }); setError(''); setEditing('new') }
  function openEdit(item: T) { setValues({ ...(item as unknown as FormValues) }); setError(''); setEditing(item) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const missing = fields.find((f) => f.required && !String(values[f.name] ?? '').trim())
    if (missing) { setError(`${missing.label} is required`); return }
    setBusy(true); setError('')
    try {
      const body = Object.fromEntries(Object.entries(values).map(([k, v]) =>
        [k, Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : v]))
      if (editing === 'new') await api.post(`/${collection}`, body)
      else if (editing) await api.put(`/${collection}/${editing.id}`, body)
      await reload()
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally { setBusy(false) }
  }

  async function remove(item: T) {
    if (!window.confirm(`Delete this ${singular}?`)) return
    try { await api.del(`/${collection}/${item.id}`); await reload() } catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-slate-400">{items.length} total</p>
        </div>
        <button onClick={openNew} className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white"><Plus size={18} /> Add {singular}</button>
      </div>

      {items.length === 0 ? <div className="card p-10 text-center text-slate-400">Nothing yet. Click "Add {singular}" to create one.</div> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">{render(item)}</div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(item)} aria-label="Edit" className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><Pencil size={17} /></button>
                <button onClick={() => remove(item)} aria-label="Delete" className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
          <form onSubmit={submit} className="card my-8 w-full max-w-xl bg-[#0b1020] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editing === 'new' ? `Add ${singular}` : `Edit ${singular}`}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"><X size={18} /></button>
            </div>
            <FormFields fields={fields} values={values} set={(n, v) => setValues((s) => ({ ...s, [n]: v }))} />
            {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl px-5 py-2.5 text-slate-300 hover:bg-white/5">Cancel</button>
              <button disabled={busy} className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-60">
                {busy && <Loader2 size={16} className="animate-spin" />} Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
