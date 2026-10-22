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
  nameBn?: string
  titleBn?: string
  welcomeBn?: string
  taglineBn?: string
  locationBn?: string
}
export interface AboutItem { id: string; icon: string; title: string; text: string; titleBn?: string; textBn?: string }
export interface Skill { id: string; name: string; category: string; categoryBn?: string; level: string; logo: string }
export interface Project {
  id: string; title: string; description: string; titleBn?: string; descriptionBn?: string; status: string
  tags: string[]; image: string; liveUrl: string; githubUrl: string
}
export interface Experience {
  id: string; period: string; current: boolean; title: string; company: string
  description: string; points: string[]; tags: string[]
  periodBn?: string; titleBn?: string; companyBn?: string; descriptionBn?: string; pointsBn?: string[]
}
export interface Service {
  id: string; icon: string; color: string; title: string; description: string; points: string[]
  titleBn?: string; descriptionBn?: string; pointsBn?: string[]
}
export interface Resume { id: string; label: string; file: string; originalName: string; size: number; createdAt: string }
export interface PortfolioData {
  profile: Profile
  about: AboutItem[]
  skills: Skill[]
  projects: Project[]
  experience: Experience[]
  services: Service[]
  resumes: Resume[]
}
export interface AuthUser { id: string; name: string; email: string; role: 'owner' | 'editor'; createdAt: string }
export interface Message { id: string; name: string; email: string; subject: string; message: string; read: boolean; createdAt: string }
