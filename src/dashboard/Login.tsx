import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/admin" replace />

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try { await login(email, password); nav('/admin') }
    catch (err) { setError(err instanceof Error ? err.message : 'Login failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="page-bg flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500"><Lock className="text-white" /></div>
        <h1 className="text-center font-display text-2xl font-bold text-white">Dashboard login</h1>
        <p className="mb-6 mt-1 text-center text-sm text-slate-400">Only authorized users can continue.</p>
        <div className="space-y-4">
          <input className="input" type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="btn-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white disabled:opacity-60">{busy && <Loader2 size={16} className="animate-spin" />} Log in</button>
        <a href="/" className="mt-4 block text-center text-sm text-slate-400 hover:text-white">← Back to site</a>
      </form>
    </div>
  )
}
