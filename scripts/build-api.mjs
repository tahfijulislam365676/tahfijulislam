// Bundles the Express API (server/src) into ONE self-contained file for Vercel: api/index.js
// Run automatically by `npm run build`. The generated file can be committed to GitHub.
import { build } from 'esbuild'

await build({
  entryPoints: ['server/src/vercel-entry.ts'],
  outfile: 'api/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  logLevel: 'warning',
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
})
console.log('api/index.js built')
