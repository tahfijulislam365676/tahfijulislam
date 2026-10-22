import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Redis } from '@upstash/redis'

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
  nameBn: string
  titleBn: string
  welcomeBn: string
  taglineBn: string
  locationBn: string
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
  jwtSecret?: string
  ownerResetApplied?: string
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

export const defaults = (): Schema => ({
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
    nameBn: 'মোঃ তাহফিজুল ইসলাম',
    titleBn: 'ফুল স্ট্যাক ওয়েব ডেভেলপার',
    welcomeBn: 'আমার পোর্টফোলিওতে স্বাগতম',
    taglineBn: 'আমি পরিচ্ছন্ন, আধুনিক ও রেসপনসিভ ওয়েব অ্যাপ্লিকেশনের মাধ্যমে ধারণাকে ব্যবহারযোগ্য ডিজিটাল সমাধানে রূপ দিই।',
    locationBn: 'বাংলাদেশ',
  },
  about: [
    {
      id: randomUUID(),
      icon: 'graduation',
      title: 'Status',
      text: "I'm a student and Full Stack Web Developer who enjoys learning, building and exploring technology. I turn ideas into practical digital solutions and keep improving how I design and develop web applications.",
      titleBn: 'বর্তমান অবস্থা',
      textBn: 'আমি একজন শিক্ষার্থী ও ফুল স্ট্যাক ওয়েব ডেভেলপার। শেখা, তৈরি করা এবং প্রযুক্তি নিয়ে অনুসন্ধান করতে আমি ভালোবাসি। ধারণাকে ব্যবহারিক ডিজিটাল সমাধানে রূপ দিই এবং ওয়েব অ্যাপ্লিকেশন ডিজাইন ও ডেভেলপ করার পদ্ধতি ক্রমাগত উন্নত করি।',
    },
    {
      id: randomUUID(),
      icon: 'code',
      title: 'Introduction',
      text: "For me, web development is more than writing code. It's a way to understand how technology works, solve real-world problems and build products people can actually use.",
      titleBn: 'পরিচিতি',
      textBn: 'আমার কাছে ওয়েব ডেভেলপমেন্ট শুধু কোড লেখা নয়। এটি প্রযুক্তি কীভাবে কাজ করে তা বোঝার, বাস্তব সমস্যার সমাধান করার এবং মানুষ সত্যিই ব্যবহার করতে পারে এমন পণ্য তৈরি করার একটি মাধ্যম।',
    },
    {
      id: randomUUID(),
      icon: 'bulb',
      title: 'Development philosophy',
      text: 'My vision goes beyond web development. I want to build my own technology ecosystem and create products across devices, programming languages, operating systems, AI and other areas.',
      titleBn: 'ডেভেলপমেন্ট দর্শন',
      textBn: 'আমার স্বপ্ন ওয়েব ডেভেলপমেন্টের বাইরেও বিস্তৃত। আমি নিজের প্রযুক্তি ইকোসিস্টেম গড়তে এবং বিভিন্ন ডিভাইস, প্রোগ্রামিং ভাষা, অপারেটিং সিস্টেম, এআই ও অন্যান্য ক্ষেত্রে পণ্য তৈরি করতে চাই।',
    },
    {
      id: randomUUID(),
      icon: 'target',
      title: 'Long-term vision',
      text: "I'm focused on growing as a developer, strengthening my problem-solving and building a strong foundation for creating larger technology products in the future.",
      titleBn: 'দীর্ঘমেয়াদি লক্ষ্য',
      textBn: 'আমি একজন ডেভেলপার হিসেবে নিজেকে গড়ে তুলতে, সমস্যা সমাধানের দক্ষতা বাড়াতে এবং ভবিষ্যতে বড় প্রযুক্তি পণ্য তৈরির শক্ত ভিত্তি গড়তে মনোযোগী।',
    },
  ],
  skills: [
    { id: randomUUID(), name: 'JavaScript', category: 'Programming language', categoryBn: 'প্রোগ্রামিং ভাষা', level: 'Intermediate', logo: '' },
    { id: randomUUID(), name: 'HTML', category: 'Markup language', categoryBn: 'মার্কআপ ভাষা', level: 'Advanced', logo: '' },
    { id: randomUUID(), name: 'CSS', category: 'Styling language', categoryBn: 'স্টাইলিং ভাষা', level: 'Advanced', logo: '' },
    { id: randomUUID(), name: 'PHP', category: 'Programming language', categoryBn: 'প্রোগ্রামিং ভাষা', level: 'Intermediate', logo: '' },
  ],
  projects: [
    {
      id: randomUUID(),
      title: 'Todo Application',
      description: 'A responsive task manager for creating, editing and organizing daily tasks.',
      titleBn: 'টুডু অ্যাপ্লিকেশন',
      descriptionBn: 'দৈনন্দিন কাজ তৈরি, সম্পাদনা ও সাজানোর জন্য একটি রেসপনসিভ টাস্ক ম্যানেজার।',
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
      titleBn: 'ই-কমার্স ওয়েবসাইট',
      descriptionBn: 'পণ্য দেখা ও কেনাকাটা পরিচালনার জন্য একটি আধুনিক অনলাইন স্টোর।',
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
      titleBn: 'পোর্টফোলিও ওয়েবসাইট',
      descriptionBn: 'দক্ষতা, প্রজেক্ট ও অভিজ্ঞতা তুলে ধরার একটি রেসপনসিভ পোর্টফোলিও।',
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
      periodBn: 'জানুয়ারি ২০২৬ থেকে বর্তমান',
      current: true,
      title: 'Full Stack Web Developer',
      titleBn: 'ফুল স্ট্যাক ওয়েব ডেভেলপার',
      company: 'Self-employed / Personal development',
      companyBn: 'স্বনিয়োজিত / ব্যক্তিগত উন্নয়ন',
      description:
        'Building responsive web applications, improving development skills and turning ideas into practical digital solutions.',
      descriptionBn:
        'রেসপনসিভ ওয়েব অ্যাপ্লিকেশন তৈরি, ডেভেলপমেন্ট দক্ষতা উন্নয়ন এবং ধারণাকে ব্যবহারিক ডিজিটাল সমাধানে রূপ দেওয়া।',
      points: [
        'Developing responsive web applications.',
        'Building user-friendly, modern interfaces.',
        'Improving problem-solving skills.',
      ],
      pointsBn: [
        'রেসপনসিভ ওয়েব অ্যাপ্লিকেশন ডেভেলপ করা।',
        'ব্যবহারবান্ধব ও আধুনিক ইন্টারফেস তৈরি করা।',
        'সমস্যা সমাধানের দক্ষতা বাড়ানো।',
      ],
      tags: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    },
    {
      id: randomUUID(),
      period: '2025 to 2026',
      periodBn: '২০২৫ থেকে ২০২৬',
      current: false,
      title: 'Web Developer',
      titleBn: 'ওয়েব ডেভেলপার',
      company: 'Personal projects',
      companyBn: 'ব্যক্তিগত প্রজেক্ট',
      description:
        'Built personal web projects to gain practical experience in frontend and backend development.',
      descriptionBn:
        'ফ্রন্টএন্ড ও ব্যাকএন্ড ডেভেলপমেন্টে বাস্তব অভিজ্ঞতা অর্জনের জন্য ব্যক্তিগত ওয়েব প্রজেক্ট তৈরি করেছি।',
      points: [],
      pointsBn: [],
      tags: [],
    },
  ],
  services: [
    { id: randomUUID(), icon: 'code', color: 'sky', title: 'Website development', titleBn: 'ওয়েবসাইট ডেভেলপমেন্ট', description: 'Modern, responsive websites for businesses, individuals and personal brands.', descriptionBn: 'ব্যবসা, ব্যক্তি ও পার্সোনাল ব্র্যান্ডের জন্য আধুনিক ও রেসপনসিভ ওয়েবসাইট।', points: ['Responsive design', 'Modern UI', 'Performance focused'], pointsBn: ['রেসপনসিভ ডিজাইন', 'আধুনিক ইউআই', 'পারফরম্যান্স-কেন্দ্রিক'] },
    { id: randomUUID(), icon: 'window', color: 'indigo', title: 'Web application', titleBn: 'ওয়েব অ্যাপ্লিকেশন', description: 'Interactive, scalable web apps designed to solve real-world problems.', descriptionBn: 'বাস্তব সমস্যার সমাধানে তৈরি ইন্টারঅ্যাকটিভ ও স্কেলেবল ওয়েব অ্যাপ।', points: ['Interactive interface', 'Dynamic features', 'Scalable structure'], pointsBn: ['ইন্টারঅ্যাকটিভ ইন্টারফেস', 'ডায়নামিক ফিচার', 'স্কেলেবল কাঠামো'] },
    { id: randomUUID(), icon: 'monitor', color: 'cyan', title: 'Landing page development', titleBn: 'ল্যান্ডিং পেজ ডেভেলপমেন্ট', description: 'Clean, focused pages that present your product or service clearly.', descriptionBn: 'আপনার পণ্য বা সেবা স্পষ্টভাবে উপস্থাপনের জন্য পরিচ্ছন্ন ও লক্ষ্যভিত্তিক পেজ।', points: ['Responsive layout', 'Modern design', 'Conversion focused'], pointsBn: ['রেসপনসিভ লেআউট', 'আধুনিক ডিজাইন', 'কনভার্সন-কেন্দ্রিক'] },
    { id: randomUUID(), icon: 'cart', color: 'emerald', title: 'E-commerce development', titleBn: 'ই-কমার্স ডেভেলপমেন্ট', description: 'Online stores with product management and smooth shopping experiences.', descriptionBn: 'পণ্য ব্যবস্থাপনা ও মসৃণ কেনাকাটার অভিজ্ঞতাসহ অনলাইন স্টোর।', points: ['Product management', 'Cart & checkout', 'Order handling'], pointsBn: ['পণ্য ব্যবস্থাপনা', 'কার্ট ও চেকআউট', 'অর্ডার ব্যবস্থাপনা'] },
    { id: randomUUID(), icon: 'wrench', color: 'orange', title: 'Website maintenance', titleBn: 'ওয়েবসাইট রক্ষণাবেক্ষণ', description: 'Keeping existing websites updated, secure and running smoothly.', descriptionBn: 'বিদ্যমান ওয়েবসাইট হালনাগাদ, নিরাপদ ও সচল রাখা।', points: ['Bug fixing', 'Updates', 'Improvements'], pointsBn: ['বাগ ফিক্সিং', 'আপডেট', 'উন্নয়ন'] },
    { id: randomUUID(), icon: 'database', color: 'pink', title: 'API and backend development', titleBn: 'এপিআই ও ব্যাকএন্ড ডেভেলপমেন্ট', description: 'Backend systems and APIs that connect your app to reliable data.', descriptionBn: 'আপনার অ্যাপকে নির্ভরযোগ্য ডেটার সাথে যুক্ত করার ব্যাকএন্ড সিস্টেম ও এপিআই।', points: ['REST API', 'Authentication', 'Database design'], pointsBn: ['REST API', 'অথেনটিকেশন', 'ডেটাবেস ডিজাইন'] },
  ],
  resumes: [],
  messages: [],
  users: [],
})

const KEY = 'portfolio:db'

function redisConf() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || ''
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
  return { url, token }
}
export const isRemote = () => {
  const c = redisConf()
  return Boolean(c.url && c.token)
}
let redis: Redis | null = null
const client = () => (redis ??= new Redis(redisConf()))

let db: Schema
let localLoaded = false

function merge(saved: Partial<Schema> | null): Schema {
  const base = defaults()
  if (!saved) return base
  return { ...base, ...saved, profile: { ...base.profile, ...(saved.profile || {}) } }
}

/** Loads data. On Vercel (Upstash Redis) it reads fresh on every request; locally it reads db.json once. */
export async function load(): Promise<Schema> {
  let isNew = false
  if (isRemote()) {
    const saved = await client().get<Partial<Schema>>(KEY)
    isNew = !saved
    db = merge(saved)
  } else if (process.env.VERCEL) {
    throw new Error('Database is not configured. In Vercel open Storage, add "Upstash Redis", connect it to this project and redeploy.')
  } else if (localLoaded) {
    return db
  } else {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const exists = fs.existsSync(DB_FILE)
    isNew = !exists
    db = merge(exists ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) : null)
    localLoaded = true
  }
  if ((await prepare()) || isNew) await save()
  return db
}

/** Secret + owner account setup. Returns true when something changed and must be saved. */
async function prepare(): Promise<boolean> {
  let dirty = false
  if (!db.jwtSecret) {
    db.jwtSecret = randomBytes(32).toString('hex')
    dirty = true
  }
  const email = (process.env.OWNER_EMAIL || '').trim().toLowerCase()
  const password = process.env.OWNER_PASSWORD || ''
  if (email && password) {
    const owner = db.users.find((u) => u.role === 'owner')
    const resetToken = process.env.OWNER_RESET_TOKEN || ''
    if (!owner) {
      db.users.push({
        id: randomUUID(),
        name: process.env.OWNER_NAME || 'Owner',
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'owner',
        createdAt: new Date().toISOString(),
      })
      dirty = true
    } else if (resetToken && db.ownerResetApplied !== resetToken) {
      // set OWNER_RESET_TOKEN to any new value to force the owner login back to OWNER_EMAIL / OWNER_PASSWORD
      owner.email = email
      owner.passwordHash = await bcrypt.hash(password, 12)
      db.ownerResetApplied = resetToken
      dirty = true
    }
  }
  return dirty
}

export async function save(): Promise<void> {
  if (isRemote()) {
    await client().set(KEY, db)
    return
  }
  const tmp = DB_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, DB_FILE)
}

export function get(): Schema {
  return db
}
