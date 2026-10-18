import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { api } from '../lib/api'
import { COLOR_NAMES, COLORS, ICON_NAMES, Icon } from '../lib/icons'

export type FieldType = 'text' | 'textarea' | 'select' | 'image' | 'list' | 'checkbox' | 'icon' | 'color' | 'url'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
  hint?: string
  required?: boolean
}

export type FormValues = Record<string, unknown>

export function ImageUpload({ value, onChange, round }: { value: string; onChange: (v: string) => void; round?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function pick(file?: File) {
    if (!file) return
    setBusy(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await api.upload<{ url: string }>('/upload/image', fd)
      onChange(r.url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-slate-800/60 ${round ? 'rounded-full' : 'rounded-2xl'}`}>
          {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="text-slate-500" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {value ? 'Change' : 'Upload'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10">
              <X size={15} /> Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}
    </div>
  )
}

export function FieldInput({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${def.name}`
  switch (def.type) {
    case 'textarea':
      return <textarea id={id} rows={4} className="input" value={(value as string) ?? ''} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
    case 'select':
      return (
        <select id={id} className="input" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    case 'image':
      return <ImageUpload value={(value as string) ?? ''} onChange={onChange} />
    case 'list':
      return (
        <textarea id={id} rows={4} className="input" placeholder={def.placeholder ?? 'One item per line'}
          value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
          onChange={(e) => onChange(e.target.value.split('\n'))} />
      )
    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-center gap-3 text-slate-200">
          <input id={id} type="checkbox" className="h-4 w-4 accent-violet-500" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          {def.placeholder}
        </label>
      )
    case 'icon':
      return (
        <div className="flex flex-wrap gap-2">
          {ICON_NAMES.map((n) => (
            <button key={n} type="button" title={n} onClick={() => onChange(n)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${value === n ? 'border-violet-400 bg-violet-500/20 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
              <Icon name={n} className="h-4 w-4" />
            </button>
          ))}
        </div>
      )
    case 'color':
      return (
        <div className="flex flex-wrap gap-2">
          {COLOR_NAMES.map((n) => (
            <button key={n} type="button" title={n} onClick={() => onChange(n)}
              className={`h-8 w-8 rounded-full border-2 ${COLORS[n].box} ${value === n ? 'border-white' : 'border-transparent'}`}>
              <span className={`block h-full w-full rounded-full ${COLORS[n].text} bg-current opacity-80`} />
            </button>
          ))}
        </div>
      )
    default:
      return <input id={id} className="input" type={def.type === 'url' ? 'url' : 'text'} value={(value as string) ?? ''} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
  }
}

export function FormFields({ fields, values, set }: { fields: FieldDef[]; values: FormValues; set: (name: string, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type !== 'checkbox' && <label htmlFor={`f-${f.name}`} className="mb-2 block text-sm font-medium text-slate-300">{f.label}{f.required && <span className="text-pink-400"> *</span>}</label>}
          <FieldInput def={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
          {f.hint && <p className="mt-1.5 text-xs text-slate-500">{f.hint}</p>}
        </div>
      ))}
    </div>
  )
}
