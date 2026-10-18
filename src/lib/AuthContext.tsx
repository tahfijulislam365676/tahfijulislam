import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from './api'
import type { AuthUser } from '../types'

interface Ctx {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
const AuthCtx = createContext<Ctx>({ user: null, loading: true, login: async () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { setLoading(false); return }
    api.get<{ user: AuthUser }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password })
    setToken(r.token)
    setUser(r.user)
  }, [])
  const logout = useCallback(() => { setToken(null); setUser(null) }, [])

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)
