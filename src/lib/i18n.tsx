import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export type Lang = 'en' | 'bn'

const en = {
  'nav.home': 'Home', 'nav.about': 'About', 'nav.skills': 'Skills', 'nav.projects': 'Projects',
  'nav.experience': 'Experience', 'nav.services': 'Services', 'nav.resume': 'Resume', 'nav.contact': 'Contact',
  'lang.switch': 'Switch language',
  'hero.available': 'Available for work', 'hero.im': "I'm", 'hero.viewProjects': 'View projects',
  'hero.resume': 'Resume', 'hero.chipFull': 'Full Stack', 'hero.photoAlt': 'Profile photo',
  'about.eyebrow': 'About me', 'about.title': 'Who I am',
  'about.subtitle': 'A short look at what drives me as a developer.', 'about.empty': 'Nothing here yet.',
  'skills.eyebrow': 'Skills', 'skills.title': 'Technologies I work with',
  'skills.subtitle': 'Languages and tools I use to build things.', 'skills.empty': 'No skills added yet.',
  'projects.eyebrow': 'Projects', 'projects.title': "Things I've built",
  'projects.subtitle': 'A selection of my recent work.', 'projects.empty': 'No projects added yet.',
  'projects.live': 'Live demo', 'projects.github': 'GitHub', 'projects.noDemo': 'No demo yet', 'projects.private': 'Private',
  'exp.eyebrow': 'Experience', 'exp.title': 'My journey so far', 'exp.empty': 'No experience added yet.', 'exp.current': 'Current',
  'services.eyebrow': 'Services', 'services.title': 'How I can help',
  'services.subtitle': 'Services I offer to clients and teams.', 'services.empty': 'No services added yet.',
  'resume.eyebrow': 'Resume', 'resume.title': 'My CV', 'resume.subtitle': 'View it online or download a copy.',
  'resume.view': 'View', 'resume.download': 'Download', 'resume.empty': 'No resume has been uploaded yet.',
  'contact.eyebrow': 'Contact', 'contact.title': 'Get in touch',
  'contact.subtitle': "Have a project or an idea? Send me a message and I'll reply as soon as I can.",
  'contact.details': 'Contact details', 'contact.email': 'Email', 'contact.whatsapp': 'WhatsApp',
  'contact.phone': 'Phone', 'contact.location': 'Location', 'contact.findMe': 'Find me online',
  'contact.sendTitle': 'Send a message', 'contact.name': 'Name', 'contact.namePh': 'Your name',
  'contact.subject': 'Subject', 'contact.subjectPh': 'Project discussion',
  'contact.message': 'Message', 'contact.messagePh': 'Tell me about your project…',
  'contact.send': 'Send message', 'contact.sending': 'Sending…',
  'contact.sent': "Thank you! Your message has been sent. I'll get back to you soon.",
  'footer.rights': 'All rights reserved.', 'footer.admin': 'Admin login',
  'status.Completed': 'Completed', 'status.In progress': 'In progress', 'status.Planned': 'Planned',
  'level.Beginner': 'Beginner', 'level.Intermediate': 'Intermediate', 'level.Advanced': 'Advanced', 'level.Expert': 'Expert',
} as const

export type TKey = keyof typeof en

const bn: Record<TKey, string> = {
  'nav.home': 'হোম', 'nav.about': 'পরিচিতি', 'nav.skills': 'দক্ষতা', 'nav.projects': 'প্রজেক্ট',
  'nav.experience': 'অভিজ্ঞতা', 'nav.services': 'সেবা', 'nav.resume': 'সিভি', 'nav.contact': 'যোগাযোগ',
  'lang.switch': 'ভাষা পরিবর্তন করুন',
  'hero.available': 'কাজের জন্য প্রস্তুত', 'hero.im': 'আমি', 'hero.viewProjects': 'প্রজেক্ট দেখুন',
  'hero.resume': 'সিভি', 'hero.chipFull': 'ফুল স্ট্যাক', 'hero.photoAlt': 'প্রোফাইল ছবি',
  'about.eyebrow': 'আমার সম্পর্কে', 'about.title': 'আমি কে',
  'about.subtitle': 'একজন ডেভেলপার হিসেবে কী আমাকে এগিয়ে নেয়, তারই সংক্ষিপ্ত পরিচয়।', 'about.empty': 'এখানে এখনো কিছু নেই।',
  'skills.eyebrow': 'দক্ষতা', 'skills.title': 'যেসব প্রযুক্তি নিয়ে কাজ করি',
  'skills.subtitle': 'যেসব ভাষা ও টুল দিয়ে আমি কাজ করি।', 'skills.empty': 'এখনো কোনো দক্ষতা যোগ করা হয়নি।',
  'projects.eyebrow': 'প্রজেক্ট', 'projects.title': 'আমার তৈরি কাজ',
  'projects.subtitle': 'সাম্প্রতিক কিছু কাজের সংকলন।', 'projects.empty': 'এখনো কোনো প্রজেক্ট যোগ করা হয়নি।',
  'projects.live': 'লাইভ ডেমো', 'projects.github': 'গিটহাব', 'projects.noDemo': 'ডেমো নেই', 'projects.private': 'প্রাইভেট',
  'exp.eyebrow': 'অভিজ্ঞতা', 'exp.title': 'এখন পর্যন্ত আমার পথচলা', 'exp.empty': 'এখনো কোনো অভিজ্ঞতা যোগ করা হয়নি।', 'exp.current': 'চলমান',
  'services.eyebrow': 'সেবা', 'services.title': 'আমি যেভাবে সাহায্য করতে পারি',
  'services.subtitle': 'ক্লায়েন্ট ও টিমের জন্য আমার সেবাসমূহ।', 'services.empty': 'এখনো কোনো সেবা যোগ করা হয়নি।',
  'resume.eyebrow': 'সিভি', 'resume.title': 'আমার সিভি', 'resume.subtitle': 'অনলাইনে দেখুন অথবা ডাউনলোড করে নিন।',
  'resume.view': 'দেখুন', 'resume.download': 'ডাউনলোড', 'resume.empty': 'এখনো কোনো সিভি আপলোড করা হয়নি।',
  'contact.eyebrow': 'যোগাযোগ', 'contact.title': 'যোগাযোগ করুন',
  'contact.subtitle': 'কোনো প্রজেক্ট বা আইডিয়া আছে? আমাকে মেসেজ পাঠান, আমি যত দ্রুত সম্ভব উত্তর দেব।',
  'contact.details': 'যোগাযোগের তথ্য', 'contact.email': 'ইমেইল', 'contact.whatsapp': 'হোয়াটসঅ্যাপ',
  'contact.phone': 'ফোন', 'contact.location': 'অবস্থান', 'contact.findMe': 'অনলাইনে আমাকে খুঁজুন',
  'contact.sendTitle': 'মেসেজ পাঠান', 'contact.name': 'নাম', 'contact.namePh': 'আপনার নাম',
  'contact.subject': 'বিষয়', 'contact.subjectPh': 'প্রজেক্ট নিয়ে আলোচনা',
  'contact.message': 'বার্তা', 'contact.messagePh': 'আপনার প্রজেক্ট সম্পর্কে বলুন…',
  'contact.send': 'মেসেজ পাঠান', 'contact.sending': 'পাঠানো হচ্ছে…',
  'contact.sent': 'ধন্যবাদ! আপনার মেসেজ পাঠানো হয়েছে। আমি শীঘ্রই উত্তর দেব।',
  'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।', 'footer.admin': 'অ্যাডমিন লগিন',
  'status.Completed': 'সম্পন্ন', 'status.In progress': 'চলমান', 'status.Planned': 'পরিকল্পিত',
  'level.Beginner': 'শিক্ষানবিস', 'level.Intermediate': 'মধ্যম', 'level.Advanced': 'উন্নত', 'level.Expert': 'বিশেষজ্ঞ',
}

const dict: Record<Lang, Record<string, string>> = { en, bn }

interface Ctx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey) => string
  /** Translate a dynamic value such as a status or level: tv('status', 'Completed') */
  tv: (prefix: 'status' | 'level', value: string) => string
  /** Read a field in the current language, falling back to English: pick(item, 'title') */
  pick: (obj: object, field: string) => string
  pickList: (obj: object, field: string) => string[]
  /** Format a number (e.g. a year) in the current language */
  num: (n: number) => string
}

const LangCtx = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('lang')
      if (s === 'bn' || s === 'en') return s
    } catch { /* ignore */ }
    return 'en'
  })
  const { pathname } = useLocation()
  // the dashboard always stays English
  const active: Lang = pathname.startsWith('/admin') ? 'en' : lang

  useEffect(() => {
    document.documentElement.lang = active
  }, [active])

  const change = useCallback((l: Lang) => {
    setLang(l)
    try { localStorage.setItem('lang', l) } catch { /* ignore */ }
  }, [])

  const value = useMemo<Ctx>(() => {
    const t = (key: TKey) => dict[active][key] ?? en[key]
    const read = (obj: object, field: string): unknown => (obj as Record<string, unknown>)[field]
    return {
      lang: active,
      setLang: change,
      t,
      tv: (prefix, value) => dict[active][`${prefix}.${value}`] ?? value,
      pick: (obj, field) => {
        const alt = read(obj, `${field}Bn`)
        const base = read(obj, field)
        return active === 'bn' && typeof alt === 'string' && alt.trim() ? alt : typeof base === 'string' ? base : ''
      },
      pickList: (obj, field) => {
        const alt = read(obj, `${field}Bn`)
        const base = read(obj, field)
        if (active === 'bn' && Array.isArray(alt) && alt.length) return alt as string[]
        return Array.isArray(base) ? (base as string[]) : []
      },
      num: (n) => (active === 'bn' ? n.toLocaleString('bn-BD', { useGrouping: false }) : String(n)),
    }
  }, [active, change])

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang(): Ctx {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang must be used inside LangProvider')
  return c
}
