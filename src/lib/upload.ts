import { api, getToken } from './api'
import type { Resume } from '../types'

interface Config { blob: boolean }
let config: Promise<Config> | null = null
const getConfig = () => (config ??= api.get<Config>('/config').catch(() => ({ blob: false })))

const safeName = (name: string) => name.replace(/[^\w.-]+/g, '_').slice(-80) || 'file'

async function toBlob(file: File, folder: 'uploads' | 'resumes'): Promise<string> {
  const { upload } = await import('@vercel/blob/client')
  const res = await upload(`${folder}/${safeName(file.name)}`, file, {
    access: 'public',
    handleUploadUrl: '/api/blob-upload',
    clientPayload: getToken() ?? '',
    contentType: file.type || undefined,
    multipart: file.size > 8 * 1024 * 1024,
  })
  return res.url
}

/** Uploads an image and returns the URL to store (Vercel Blob in production, local disk in development). */
export async function uploadImage(file: File): Promise<string> {
  if ((await getConfig()).blob) return toBlob(file, 'uploads')
  const fd = new FormData()
  fd.append('file', file)
  return (await api.upload<{ url: string }>('/upload/image', fd)).url
}

/** Uploads a CV/resume file and registers it. */
export async function uploadResume(file: File, label: string): Promise<Resume> {
  if ((await getConfig()).blob) {
    const url = await toBlob(file, 'resumes')
    return api.post<Resume>('/resumes/link', { label, file: url, originalName: file.name, size: file.size })
  }
  const fd = new FormData()
  fd.append('label', label)
  fd.append('file', file)
  return api.upload<Resume>('/resumes', fd)
}
