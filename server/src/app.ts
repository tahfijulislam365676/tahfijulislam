import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { del } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { load, save, get, isRemote, type Role, type User } from './db.js'
import { loadEnv } from './env.js'

loadEnv()

const LOCAL = !process.env.VERCEL
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')
if (LOCAL) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function jwtSecret() {
  const fromEnv = process.env.JWT_SECRET || ''
  if (fromEnv.length >= 16 && fromEnv !== 'change-me-to-a-long-random-string') return fromEnv
  return get().jwtSecret as string
}

const app = express()
app.disable('x-powered-by')
if (!LOCAL) app.set('trust proxy', 1) // behind Vercel's proxy: use the real visitor IP for rate limits

// Vercel rewrites /api/<path> to the single function as /api?__p=<path>; restore the real path here.
app.use((req, _res, next) => {
  if (req.url.includes('__p=')) {
    const u = new URL(req.url, 'http://local')
    const p = u.searchParams.get('__p')
    if (p !== null) {
      u.searchParams.delete('__p')
      req.url = '/api/' + p.replace(/^\/+/, '') + u.search
    }
  }
  next()
})
app.use(cors({ origin: CLIENT_ORIGIN.split(','), credentials: false }))
app.use(express.json({ limit: '1mb' }))

// load data (fresh from Redis on Vercel) before every API request
app.use('/api', async (_req, res, next) => {
  try {
    await load()
    next()
  } catch (e) {
    console.error('[api] load failed:', e)
    res.status(503).json({ error: e instanceof Error ? e.message : 'Database error' })
  }
})

if (LOCAL) {
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
}

// ---- helpers ----
interface AuthedRequest extends Request {
  user?: User
}

const str = (v: unknown, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const strList = (v: unknown, maxItems = 30, max = 300) =>
  Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, maxItems) : []
const bool = (v: unknown) => v === true || v === 'true'
const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./%~+-]+$/i
const safeUploadPath = (p: string) => (/^\/uploads\/[\w.-]+$/.test(p) || BLOB_URL.test(p) ? p : '')

function publicUser(u: User) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }
}

function signToken(u: User) {
  return jwt.sign({ sub: u.id }, jwtSecret(), { expiresIn: '7d' })
}

function userFromToken(token: string): User | null {
  try {
    const payload = jwt.verify(token, jwtSecret()) as { sub: string }
    return get().users.find((u) => u.id === payload.sub) ?? null
  } catch {
    return null
  }
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const user = userFromToken(header.startsWith('Bearer ') ? header.slice(7) : '')
  if (!user) return res.status(401).json({ error: 'Not authorized' })
  req.user = user
  next()
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

app.get('/api/auth/me', requireAuth, async (req: AuthedRequest, res) => {
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
  await save()
  res.json({ ok: true })
})

// ---- users (owner only) ----
app.get('/api/users', requireAuth, requireOwner, async (_req, res) => {
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
  await save()
  res.status(201).json(publicUser(user))
})

app.delete('/api/users/:id', requireAuth, requireOwner, async (req, res) => {
  const db = get()
  const target = db.users.find((u) => u.id === req.params.id)
  if (!target) return res.status(404).json({ error: 'Not found' })
  if (target.role === 'owner') return res.status(400).json({ error: 'The owner cannot be removed' })
  db.users = db.users.filter((u) => u.id !== target.id)
  await save()
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

const imageUpload = LOCAL ? makeUploader(IMAGE_TYPES, 5).single('file') : null
const docUpload = LOCAL ? makeUploader(DOC_TYPES, 15).single('file') : null

async function removeUpload(p: unknown) {
  if (typeof p !== 'string' || !safeUploadPath(p)) return
  try {
    if (BLOB_URL.test(p)) await del(p)
    else if (LOCAL) fs.rmSync(path.join(UPLOAD_DIR, path.basename(p)), { force: true })
  } catch {
    /* ignore: a leftover file must never break a save */
  }
}

app.post('/api/upload/image', requireAuth, async (req, res) => {
  if (!imageUpload) return res.status(501).json({ error: 'Use direct Blob upload on Vercel' })
  imageUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Only PNG, JPG, WEBP, GIF or SVG up to 5MB' })
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

// ---- upload config & direct Blob uploads (Vercel) ----
app.get('/api/config', (_req, res) => {
  res.json({ blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN), remote: isRemote() })
})

app.post('/api/blob-upload', async (req, res) => {
  try {
    const json = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!userFromToken(clientPayload || '')) throw new Error('Not authorized')
        const isDoc = pathname.startsWith('resumes/')
        return {
          allowedContentTypes: Object.keys(isDoc ? DOC_TYPES : IMAGE_TYPES),
          maximumSizeInBytes: (isDoc ? 15 : 5) * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
    })
    res.json(json)
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Upload failed' })
  }
})

// ---- public read ----
app.get('/api/public', async (_req, res) => {
  const { profile, about, skills, projects, experience, services, resumes } = get()
  res.json({ profile, about, skills, projects, experience, services, resumes })
})

// ---- profile ----
app.put('/api/profile', requireAuth, async (req, res) => {
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
  p.nameBn = str(b.nameBn, 100)
  p.titleBn = str(b.titleBn, 150)
  p.welcomeBn = str(b.welcomeBn, 200)
  p.taglineBn = str(b.taglineBn, 500)
  p.locationBn = str(b.locationBn, 100)
  if (old && old !== p.photo) await removeUpload(old)
  await save()
  res.json(p)
})

// ---- generic collections ----
type Sanitizer = (b: Record<string, unknown>) => Record<string, unknown>
const collections: Record<string, { key: 'about' | 'skills' | 'projects' | 'experience' | 'services'; clean: Sanitizer; files: string[] }> = {
  about: {
    key: 'about',
    files: [],
    clean: (b) => ({ icon: str(b.icon, 30) || 'code', title: str(b.title, 120), text: str(b.text, 2000), titleBn: str(b.titleBn, 120), textBn: str(b.textBn, 2000) }),
  },
  skills: {
    key: 'skills',
    files: ['logo'],
    clean: (b) => ({
      name: str(b.name, 80),
      category: str(b.category, 80),
      categoryBn: str(b.categoryBn, 80),
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
      titleBn: str(b.titleBn, 120),
      descriptionBn: str(b.descriptionBn, 1000),
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
      periodBn: str(b.periodBn, 80),
      titleBn: str(b.titleBn, 120),
      companyBn: str(b.companyBn, 160),
      descriptionBn: str(b.descriptionBn, 1000),
      pointsBn: strList(b.pointsBn, 12, 300),
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
      titleBn: str(b.titleBn, 120),
      descriptionBn: str(b.descriptionBn, 600),
      pointsBn: strList(b.pointsBn, 8, 120),
    }),
  },
}

for (const [route, cfg] of Object.entries(collections)) {
  const base = `/api/${route}`

  app.post(base, requireAuth, async (req, res) => {
    const data = cfg.clean(req.body || {})
    const required = route === 'skills' ? 'name' : 'title'
    if (!data[required]) return res.status(400).json({ error: `${required} is required` })
    const item = { id: randomUUID(), ...data }
    get()[cfg.key].push(item)
    await save()
    res.status(201).json(item)
  })

  app.put(`${base}/:id`, requireAuth, async (req, res) => {
    const list = get()[cfg.key]
    const idx = list.findIndex((x) => x.id === req.params.id)
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    const data = cfg.clean(req.body || {})
    const required = route === 'skills' ? 'name' : 'title'
    if (!data[required]) return res.status(400).json({ error: `${required} is required` })
    for (const f of cfg.files) if (list[idx][f] && list[idx][f] !== data[f]) await removeUpload(list[idx][f])
    list[idx] = { id: list[idx].id, ...data }
    await save()
    res.json(list[idx])
  })

  app.delete(`${base}/:id`, requireAuth, async (req, res) => {
    const db = get()
    const item = db[cfg.key].find((x) => x.id === req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    for (const f of cfg.files) await removeUpload(item[f])
    db[cfg.key] = db[cfg.key].filter((x) => x.id !== req.params.id)
    await save()
    res.json({ ok: true })
  })
}

// ---- resumes / CV ----
app.post('/api/resumes', requireAuth, async (req, res) => {
  if (!docUpload) return res.status(501).json({ error: 'Use direct Blob upload on Vercel' })
  docUpload(req, res, async (err) => {
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
    await save()
    res.status(201).json(item)
  })
})

app.post('/api/resumes/link', requireAuth, async (req, res) => {
  const file = safeUploadPath(str(req.body?.file, 500))
  if (!file || !BLOB_URL.test(file)) return res.status(400).json({ error: 'Invalid file' })
  const item = {
    id: randomUUID(),
    label: str(req.body?.label, 100) || str(req.body?.originalName, 100) || 'Resume',
    file,
    originalName: str(req.body?.originalName, 150) || 'resume',
    size: Number(req.body?.size) > 0 ? Number(req.body.size) : 0,
    createdAt: new Date().toISOString(),
  }
  get().resumes.push(item)
  await save()
  res.status(201).json(item)
})

app.delete('/api/resumes/:id', requireAuth, async (req, res) => {
  const db = get()
  const item = db.resumes.find((x) => x.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  await removeUpload(item.file)
  db.resumes = db.resumes.filter((x) => x.id !== req.params.id)
  await save()
  res.json({ ok: true })
})

// ---- contact messages ----
const msgHits = new Map<string, number[]>()
const MSG_WINDOW = 60 * 60 * 1000
const MSG_MAX = 5

app.post('/api/messages', async (req, res) => {
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
  db.messages = db.messages.slice(0, 200)
  await save()
  res.status(201).json({ ok: true })
})

app.get('/api/messages', requireAuth, (_req, res) => res.json(get().messages))

app.put('/api/messages/:id/read', requireAuth, async (req, res) => {
  const m = get().messages.find((x) => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: 'Not found' })
  m.read = true
  await save()
  res.json(m)
})

app.delete('/api/messages/:id', requireAuth, async (req, res) => {
  const db = get()
  db.messages = db.messages.filter((x) => x.id !== req.params.id)
  await save()
  res.json({ ok: true })
})

// ---- errors ----
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

export default app
