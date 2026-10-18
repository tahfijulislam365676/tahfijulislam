// Usage (stop the server first):
//   npm run reset-owner                      -> uses OWNER_EMAIL / OWNER_PASSWORD from server/.env
//   npm run reset-owner -- you@mail.com pass -> uses the values you type
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { loadEnv } from './env.js'
import { get, load, save } from './db.js'

loadEnv()
const email = (process.argv[2] || process.env.OWNER_EMAIL || '').trim().toLowerCase()
const password = process.argv[3] || process.env.OWNER_PASSWORD || ''

if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
  console.error('Need a valid email and a password of at least 8 characters (set OWNER_EMAIL and OWNER_PASSWORD in server/.env, or pass them as arguments).')
  process.exit(1)
}

load()
const db = get()
const passwordHash = bcrypt.hashSync(password, 12)
const owner = db.users.find((u) => u.role === 'owner')
if (owner) {
  owner.email = email
  owner.passwordHash = passwordHash
} else {
  db.users.push({ id: randomUUID(), name: process.env.OWNER_NAME || 'Owner', email, passwordHash, role: 'owner', createdAt: new Date().toISOString() })
}
save()
console.log(`\nOwner login is now:\n  email:    ${email}\n  password: (the one you gave)\nStart the server and log in at /admin/login\n`)
