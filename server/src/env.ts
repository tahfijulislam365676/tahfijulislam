import fs from 'node:fs'
import path from 'node:path'

/** Reads server/.env into process.env (existing environment variables win). */
export function loadEnv() {
  const file = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!m || line.trim().startsWith('#')) continue
    let value = m[2]
    if (/^(".*"|'.*')$/.test(value)) value = value.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = value
  }
}
