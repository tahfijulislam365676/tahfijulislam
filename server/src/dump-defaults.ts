// Writes the default portfolio content as JSON for the PHP (domain hosting) backend.
import fs from 'node:fs'
import { defaults } from './db.js'

const out = process.argv[2]
if (!out) throw new Error('usage: tsx src/dump-defaults.ts <output.json>')
fs.writeFileSync(out, JSON.stringify(defaults(), null, 2))
console.log('written', out)
