import type { PortfolioData } from '../types'

const TOKEN_KEY = 'portfolio_token'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (t: string | null) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const OFFLINE = 'Cannot reach the server. Make sure the API is running (start it with "npm run dev").'
  let res: Response
  try {
    res = await fetch(path, { ...init, headers })
  } catch {
    throw new ApiError(OFFLINE, 0)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error
    throw new ApiError(msg || (res.status >= 500 || data === null ? OFFLINE : 'Request failed'), res.status)
  }
  return data as T
}

export const api = {
  public: () => request<PortfolioData>('/api/public'),
  get: <T,>(p: string) => request<T>(`/api${p}`),
  post: <T,>(p: string, body: unknown) => request<T>(`/api${p}`, { method: 'POST', body: JSON.stringify(body) }),
  put: <T,>(p: string, body: unknown) => request<T>(`/api${p}`, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T,>(p: string) => request<T>(`/api${p}`, { method: 'DELETE' }),
  upload: <T,>(p: string, form: FormData) => request<T>(`/api${p}`, { method: 'POST', body: form }),
}
