import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import type { PortfolioData } from '../types'

interface Ctx {
  data: PortfolioData | null
  error: string
  reload: () => Promise<void>
}
const DataCtx = createContext<Ctx>({ data: null, error: '', reload: async () => {} })

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    try {
      setData(await api.public())
      setError('')
    } catch {
      setError('Could not load data. The API server is not running. Start it with "npm run dev" in the project folder.')
    }
  }, [])
  useEffect(() => { void reload() }, [reload])
  return <DataCtx.Provider value={{ data, error, reload }}>{children}</DataCtx.Provider>
}
export const useData = () => useContext(DataCtx)
