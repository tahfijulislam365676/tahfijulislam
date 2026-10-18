import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

export type Role = 'owner' | 'editor'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  createdAt: string
}

export interface Profile {
  name: string
  title: string
  welcome: string
  tagline: string
  photo: string
  email: string
  whatsapp: string
  github: string
  facebook: string
  phone: string
  location: string
}

export interface Schema {
  profile: Profile
  about: Record<string, unknown>[]
  skills: Record<string, unknown>[]
  projects: Record<string, unknown>[]
  experience: Record<string, unknown>[]
  services: Record<string, unknown>[]
  resumes: Record<string, unknown>[]
  messages: Record<string, unknown>[]
  users: User[]
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

const defaults = (): Schema => ({
  profile: {
    name: 'MD. TAHFIJUL ISLAM',
    title: 'Full Stack Web Developer',
    welcome: 'Welcome to my portfolio',
    tagline:
      'I turn ideas into practical digital solutions with clean, modern and responsive web applications.',
    photo: '',
    email: 'tahfijulislam365676@gmail.com',
    whatsapp: '+8801766724326',
    github: 'https://github.com/tahfijulislam365676',
    facebook: 'https://www.facebook.com/tahfijulislam.dev/',
    phone: '+8801766724326',
    location: 'Bangladesh',
  },
  about: [
    {
      id: randomUUID(),
      icon: 'graduation',
      title: 'Status',
      text: "I'm a student and Full Stack Web Developer who enjoys learning, building and exploring technology. I turn ideas into practical digital solutions and keep improving how I design and develop web applications.",
    },
    {
      id: randomUUID(),
      icon: 'code',
      title: 'Introduction',
      text: "For me, web development is more than writing code. It's a way to understand how technology works, solve real-world problems and build products people can actually use.",
    },
    {
      id: randomUUID(),
      icon: 'bulb',
      title: 'Development philosophy',
      text: 'My vision goes beyond web development. I want to build my own technology ecosystem and create products across devices, programming languages, operating systems, AI and other areas.',
    },
    {
      id: randomUUID(),
      icon: 'target',
      title: 'Long-term vision',
      text: "I'm focused on growing as a developer, strengthening my problem-solving and building a strong foundation for creating larger technology products in the future.",
    },
  ],
  skills: [
    { id: randomUUID(), name: 'JavaScript', category: 'Programming language', level: 'Intermediate', logo: '' },
    { id: randomUUID(), name: 'HTML', category: 'Markup language', level: 'Advanced', logo: '' },
    { id: randomUUID(), name: 'CSS', category: 'Styling language', level: 'Advanced', logo: '' },
    { id: randomUUID(), name: 'PHP', category: 'Programming language', level: 'Intermediate', logo: '' },
  ],
  projects: [
    {
      id: randomUUID(),
      title: 'Todo Application',
      description: 'A responsive task manager for creating, editing and organizing daily tasks.',
      status: 'Completed',
      tags: ['HTML', 'CSS', 'JavaScript'],
      image: '',
      liveUrl: '',
      githubUrl: 'https://github.com/tahfijulislam365676',
    },
    {
      id: randomUUID(),
      title: 'E-commerce Website',
      description: 'A modern online store for browsing products and managing purchases.',
      status: 'In progress',
      tags: ['HTML', 'CSS', 'PHP'],
      image: '',
      liveUrl: '',
      githubUrl: 'https://github.com/tahfijulislam365676',
    },
    {
      id: randomUUID(),
      title: 'Portfolio Website',
      description: 'A responsive portfolio showcasing skills, projects and experience.',
      status: 'Completed',
      tags: ['HTML', 'Tailwind', 'JavaScript'],
      image: '',
      liveUrl: '',
      githubUrl: 'https://github.com/tahfijulislam365676',
    },
  ],
  experience: [
    {
      id: randomUUID(),
      period: 'January 2026 to present',
      current: true,
      title: 'Full Stack Web Developer',
      company: 'Self-employed / Personal development',
      description:
        'Building responsive web applications, improving development skills and turning ideas into practical digital solutions.',
      points: [
        'Developing responsive web applications.',
        'Building user-friendly, modern interfaces.',
        'Improving problem-solving skills.',
      ],
      tags: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    },
    {
      id: randomUUID(),
      period: '2025 to 2026',
      current: false,
      title: 'Web Developer',
      company: 'Personal projects',
      description:
        'Built personal web projects to gain practical experience in frontend and backend development.',
      points: [],
      tags: [],
    },
  ],
  services: [
    { id: randomUUID(), icon: 'code', color: 'sky', title: 'Website development', description: 'Modern, responsive websites for businesses, individuals and personal brands.', points: ['Responsive design', 'Modern UI', 'Performance focused'] },
    { id: randomUUID(), icon: 'window', color: 'indigo', title: 'Web application', description: 'Interactive, scalable web apps designed to solve real-world problems.', points: ['Interactive interface', 'Dynamic features', 'Scalable structure'] },
    { id: randomUUID(), icon: 'monitor', color: 'cyan', title: 'Landing page development', description: 'Clean, focused pages that present your product or service clearly.', points: ['Responsive layout', 'Modern design', 'Conversion focused'] },
    { id: randomUUID(), icon: 'cart', color: 'emerald', title: 'E-commerce development', description: 'Online stores with product management and smooth shopping experiences.', points: ['Product management', 'Cart & checkout', 'Order handling'] },
    { id: randomUUID(), icon: 'wrench', color: 'orange', title: 'Website maintenance', description: 'Keeping existing websites updated, secure and running smoothly.', points: ['Bug fixing', 'Updates', 'Improvements'] },
    { id: randomUUID(), icon: 'database', color: 'pink', title: 'API and backend development', description: 'Backend systems and APIs that connect your app to reliable data.', points: ['REST API', 'Authentication', 'Database design'] },
  ],
  resumes: [],
  messages: [],
  users: [],
})

let db: Schema

export function load(): Schema {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  if (fs.existsSync(DB_FILE)) {
    const saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    const base = defaults()
    db = { ...base, ...saved, profile: { ...base.profile, ...(saved.profile || {}) } }
  } else {
    db = defaults()
  }
  seedOwner()
  save()
  return db
}

function seedOwner() {
  const email = (process.env.OWNER_EMAIL || '').trim().toLowerCase()
  const password = process.env.OWNER_PASSWORD || ''
  if (!email || !password) return
  const existing = db.users.find((u) => u.role === 'owner')
  if (existing) return
  db.users.push({
    id: randomUUID(),
    name: process.env.OWNER_NAME || 'Owner',
    email,
    passwordHash: bcrypt.hashSync(password, 12),
    role: 'owner',
    createdAt: new Date().toISOString(),
  })
}

export function save() {
  const tmp = DB_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, DB_FILE)
}

export function get(): Schema {
  return db
}
