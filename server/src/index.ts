console.log('[api] Starting… (Node ' + process.version + ', folder: ' + process.cwd() + ')')
process.on('uncaughtException', (e) => { console.error('[api] CRASH:', e); process.exit(1) })
process.on('unhandledRejection', (e) => { console.error('[api] UNHANDLED:', e) })

import app from './app.js'
import { get, load } from './db.js'

const PORT = Number(process.env.PORT || 4000)
const HOST = process.env.HOST || '127.0.0.1'

await load()
if (!get().users.some((u) => u.role === 'owner')) {
  console.warn('\n[!] No owner account yet. Create server/.env with OWNER_EMAIL and OWNER_PASSWORD, then run: npm run reset-owner\n')
}

const server = app.listen(PORT, HOST, () => console.log(`API running on http://localhost:${PORT}`))
server.on('error', (e: NodeJS.ErrnoException) => {
  console.error(e.code === 'EADDRINUSE'
    ? `[api] Port ${PORT} is already in use. Close the other program or change PORT in server/.env (and the proxy port in vite.config.ts).`
    : `[api] Server error: ${e.message}`)
  process.exit(1)
})
