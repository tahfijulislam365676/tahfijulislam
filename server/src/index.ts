console.log('[api] Starting… (Node ' + process.version + ', folder: ' + process.cwd() + ')')
process.on('uncaughtException', (e) => { console.error('[api] CRASH:', e); process.exit(1) })
process.on('unhandledRejection', (e) => { console.error('[api] UNHANDLED:', e) })
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { load, save, get, type Role, type User } from './db.js'
import { loadEnv } from './env.js'

// ---- env ----
loadEnv()

const PORT = Number(process.env.PORT || 4000)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
// JWT secret: from .env, otherwise generated once and kept in data/ (so a missing .env never stops the API)
function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET || ''
  if (fromEnv.length >= 16 && fromEnv !== 'change-me-to-a-long-random-string') return fromEnv
  const dir = path.resolve(process.cwd(), 'data')
  const file = path.join(dir, 'jwt-secret.txt')
  fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(file)) fs.writeFileSync(file, randomUUID() + randomUUID(), { mode: 0o600 })
  return fs.readFileSync(file, 'utf8').trim()
}
const JWT_SECRET = resolveJwtSecret()

load()
if (!get().users.some((u) => u.role === 'owner')) {
  console.warn('\n[!] No owner account yet. Create server/.env with OWNER_EMAIL and OWNER_PASSWORD, delete server/data/db.json if needed, and restart.\n')
}

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: CLIENT_ORIGIN.split(','), credentials: false }))
app.use(express.json({ limit: '1mb' }))

// uploaded files: never let them run as pages/scripts
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(UPLOAD_DIR, { dotfiles: 'deny', index: false }),
)

// ---- helpers ----
interface AuthedRequest extends Request {
  user?: User
}

const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const strList = (v: unknown, maxItems = 30, max = 300) =>
  Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, maxItems) : []
const bool = (v: unknown) => v === true || v === 'true'
const safeUploadPath = (p: string) => (/^\/uploads\/[\w.-]+$/.test(p) ? p : '')

function publicUser(u: User) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }
}

function signToken(u: User) {
  return jwt.sign({ sub: u.id }, JWT_SECRET, { expiresIn: '7d' })
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
    const user = get().users.find((u) => u.id === payload.sub)
    if (!user) throw new Error('no user')
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Not authorized' })
  }
}

function requireOwner(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'owner') return res.status(403).json({ error: 'Owner only' })
  next()
}

// ---- login (with basic brute-force protection) ----
const attempts = new Map<string, { count: number; first: number }>()
const WINDOW = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

app.post('/api/auth/login', async (req, res) => {
  const key = req.ip || 'unknown'
  const now = Date.now()
  const rec = attempts.get(key)
  if (rec && now - rec.first < WINDOW && rec.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' })
  }
  const email = str(req.body?.email, 200).toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const user = get().users.find((u) => u.email === email)
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid')
  if (!user || !ok) {
    const fresh = rec && now - rec.first < WINDOW ? rec : { count: 0, first: now }
    fresh.count += 1
    attempts.set(key, fresh)
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  attempts.delete(key)
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: publicUser(req.user!) })
})

app.post('/api/auth/password', requireAuth, async (req: AuthedRequest, res) => {
  const current = typeof req.body?.current === 'string' ? req.body.current : ''
  const next = typeof req.body?.next === 'string' ? req.body.next : ''
  if (next.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })
  if (!(await bcrypt.compare(current, req.user!.passwordHash))) {
    return res.status(400).json({ error: 'Current password is wrong' })
  }
  req.user!.passwordHash = await bcrypt.hash(next, 12)
  save()
  res.json({ ok: true })
})

// ---- users (owner only) ----
app.get('/api/users', requireAuth, requireOwner, (_req, res) => {
  res.json(get().users.map(publicUser))
})

app.post('/api/users', requireAuth, requireOwner, async (req, res) => {
  const name = str(req.body?.name, 100)
  const email = str(req.body?.email, 200).toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Valid name and email required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (get().users.some((u) => u.email === email)) return res.status(409).json({ error: 'Email already exists' })
  const user: User = {
    id: randomUUID(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'editor' as Role,
    createdAt: new Date().toISOString(),
  }
  get().users.push(user)
  save()
  res.status(201).json(publicUser(user))
})

app.delete('/api/users/:id', requireAuth, requireOwner, (req, res) => {
  const db = get()
  const target = db.users.find((u) => u.id === req.params.id)
  if (!target) return res.status(404).json({ error: 'Not found' })
  if (target.role === 'owner') return res.status(400).json({ error: 'The owner cannot be removed' })
  db.users = db.users.filter((u) => u.id !== target.id)
  save()
  res.json({ ok: true })
})

// ---- uploads ----
const IMAGE_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}
const DOC_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
}

function makeUploader(types: Record<string, string>, maxMb: number) {
  return multer({
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${types[file.mimetype]}`),
    }),
    fileFilter: (_req, file, cb) => cb(null, Boolean(types[file.mimetype])),
  })
}

const imageUpload = makeUploader(IMAGE_TYPES, 5).single('file')
const docUpload = makeUploader(DOC_TYPES, 15).single('file')

function removeUpload(p: unknown) {
  if (typeof p !== 'string' || !safeUploadPath(p)) return
  const file = path.join(UPLOAD_DIR, path.basename(p))
  fs.rm(file, { force: true }, () => {})
}

app.post('/api/upload/image', requireAuth, (req, res) => {
  imageUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Only PNG, JPG, WEBP, GIF or SVG up to 5MB' })
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

// ---- public read ----
app.get('/api/public', (_req, res) => {
  const { profile, about, skills, projects, experience, services, resumes } = get()
  res.json({ profile, about, skills, projects, experience, services, resumes })
})

// ---- profile ----
app.put('/api/profile', requireAuth, (req, res) => {
  const b = req.body || {}
  const p = get().profile
  const old = p.photo
  p.name = str(b.name, 100) || p.name
  p.title = str(b.title, 150)
  p.welcome = str(b.welcome, 200)
  p.tagline = str(b.tagline, 500)
  p.photo = typeof b.photo === 'string' ? safeUploadPath(b.photo) : p.photo
  p.email = str(b.email, 200)
  p.whatsapp = str(b.whatsapp, 40)
  p.github = str(b.github, 300)
  p.facebook = str(b.facebook, 300)
  p.phone = str(b.phone, 40)
  p.location = str(b.location, 100)
  if (old && old !== p.photo) removeUpload(old)
  save()
  res.json(p)
})

// ---- generic collections ----
type Sanitizer = (b: Record<string, unknown>) => Record<string, unknown>
const collections: Record<string, { key: 'about' | 'skills' | 'projects' | 'experience' | 'services'; clean: Sanitizer; files: string[] }> = {
  about: {
    key: 'about',
    files: [],
    clean: (b) => ({ icon: str(b.icon, 30) || 'code', title: str(b.title, 120), text: str(b.text, 2000) }),
  },
  skills: {
    key: 'skills',
    files: ['logo'],
    clean: (b) => ({
      name: str(b.name, 80),
      category: str(b.category, 80),
      level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(str(b.level)) ? str(b.level) : 'Intermediate',
      logo: safeUploadPath(str(b.logo, 200)),
    }),
  },
  projects: {
    key: 'projects',
    files: ['image'],
    clean: (b) => ({
      title: str(b.title, 120),
      description: str(b.description, 1000),
      status: ['Completed', 'In progress', 'Planned'].includes(str(b.status)) ? str(b.status) : 'Completed',
      tags: strList(b.tags, 12, 40),
      image: safeUploadPath(str(b.image, 200)),
      liveUrl: str(b.liveUrl, 300),
      githubUrl: str(b.githubUrl, 300),
    }),
  },
  experience: {
    key: 'experience',
    files: [],
    clean: (b) => ({
      period: str(b.period, 80),
      current: bool(b.current),
      title: str(b.title, 120),
      company: str(b.company, 160),
      description: str(b.description, 1000),
      points: strList(b.points, 12, 300),
      tags: strList(b.tags, 12, 40),
    }),
  },
  services: {
    key: 'services',
    files: [],
    clean: (b) => ({
      icon: str(b.icon, 30) || 'code',
      color: ['sky', 'indigo', 'cyan', 'emerald', 'orange', 'pink', 'violet', 'amber'].includes(str(b.color)) ? str(b.color) : 'sky',
      title: str(b.title, 120),
      description: str(b.description, 600),
      points: strList(b.points, 8, 120),
    }),
  },
}

for (const [route, cfg] of Object.entries(collections)) {
  const base = `/api/${route}`

  app.post(base, requireAuth, (req, res) => {
    const data = cfg.clean(req.body || {})
    const required = route === 'skills' ? 'name' : 'title'
    if (!data[required]) return res.status(400).json({ error: `${required} is required` })
    const item = { id: randomUUID(), ...data }
    get()[cfg.key].push(item)
    save()
    res.status(201).json(item)
  })

  app.put(`${base}/:id`, requireAuth, (req, res) => {
    const list = get()[cfg.key]
    const idx = list.findIndex((x) => x.id === req.params.id)
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    const data = cfg.clean(req.body || {})
    const required = route === 'skills' ? 'name' : 'title'
    if (!data[required]) return res.status(400).json({ error: `${required} is required` })
    for (const f of cfg.files) if (list[idx][f] && list[idx][f] !== data[f]) removeUpload(list[idx][f])
    list[idx] = { id: list[idx].id, ...data }
    save()
    res.json(list[idx])
  })

  app.delete(`${base}/:id`, requireAuth, (req, res) => {
    const db = get()
    const item = db[cfg.key].find((x) => x.id === req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    for (const f of cfg.files) removeUpload(item[f])
    db[cfg.key] = db[cfg.key].filter((x) => x.id !== req.params.id)
    save()
    res.json({ ok: true })
  })
}

// ---- resumes / CV ----
app.post('/api/resumes', requireAuth, (req, res) => {
  docUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Only PDF, DOC or DOCX up to 15MB' })
    const item = {
      id: randomUUID(),
      label: str(req.body?.label, 100) || req.file.originalname.slice(0, 100),
      file: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname.slice(0, 150),
      size: req.file.size,
      createdAt: new Date().toISOString(),
    }
    get().resumes.push(item)
    save()
    res.status(201).json(item)
  })
})

app.delete('/api/resumes/:id', requireAuth, (req, res) => {
  const db = get()
  const item = db.resumes.find((x) => x.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  removeUpload(item.file)
  db.resumes = db.resumes.filter((x) => x.id !== req.params.id)
  save()
  res.json({ ok: true })
})

// ---- contact messages ----
const msgHits = new Map<string, number[]>()
const MSG_WINDOW = 60 * 60 * 1000
const MSG_MAX = 5

app.post('/api/messages', (req, res) => {
  const b = req.body || {}
  // honeypot: bots fill hidden fields; pretend success
  if (str(b.website, 100)) return res.status(201).json({ ok: true })
  const key = req.ip || 'unknown'
  const now = Date.now()
  const hits = (msgHits.get(key) || []).filter((t) => now - t < MSG_WINDOW)
  if (hits.length >= MSG_MAX) return res.status(429).json({ error: 'Too many messages. Please try again later.' })
  const name = str(b.name, 100)
  const email = str(b.email, 200)
  const subject = str(b.subject, 150)
  const message = str(b.message, 3000)
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return res.status(400).json({ error: 'Please fill in your name, a valid email and a message.' })
  }
  hits.push(now)
  msgHits.set(key, hits)
  const db = get()
  db.messages.unshift({ id: randomUUID(), name, email, subject, message, read: false, createdAt: new Date().toISOString() })
  db.messages = db.messages.slice(0, 500)
  save()
  res.status(201).json({ ok: true })
})

app.get('/api/messages', requireAuth, (_req, res) => res.json(get().messages))

app.put('/api/messages/:id/read', requireAuth, (req, res) => {
  const m = get().messages.find((x) => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: 'Not found' })
  m.read = true
  save()
  res.json(m)
})

app.delete('/api/messages/:id', requireAuth, (req, res) => {
  const db = get()
  db.messages = db.messages.filter((x) => x.id !== req.params.id)
  save()
  res.json({ ok: true })
})

// ---- errors ----
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

const HOST = process.env.HOST || '127.0.0.1'
const server = app.listen(PORT, HOST, () => console.log(`API running on http://localhost:${PORT}`))
server.on('error', (e: NodeJS.ErrnoException) => {
  console.error(e.code === 'EADDRINUSE'
    ? `[api] Port ${PORT} is already in use. Close the other program or change PORT in server/.env (and the proxy port in vite.config.ts).`
    : `[api] Server error: ${e.message}`)
  process.exit(1)
})
