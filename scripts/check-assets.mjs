#!/usr/bin/env node
/**
 * Reports which production assets are still outstanding.
 *
 * Reads the same manifest the app uses, so this script and the `?debug=assets`
 * overlay can never disagree.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'src/data/assets.ts'), 'utf8')

const entries = [...source.matchAll(/path:\s*'([^']+)',\s*\n\s*kind:\s*'([^']+)',[\s\S]*?requiredForFinal:\s*(true|false),/g)].map(
  ([, assetPath, kind, required]) => ({ path: assetPath, kind, required: required === 'true' }),
)

if (entries.length === 0) {
  console.error('Could not parse src/data/assets.ts — has the manifest shape changed?')
  process.exit(1)
}

const rows = entries.map((entry) => {
  const full = path.join(root, 'public', entry.path)
  const present = fs.existsSync(full) && fs.statSync(full).size > 0
  return { ...entry, present }
})

const missingRequired = rows.filter((r) => !r.present && r.required)
const missingOptional = rows.filter((r) => !r.present && !r.required)

const pad = (s, n) => String(s).padEnd(n)
console.log(`\nCoconut Bros — asset status (${rows.filter((r) => r.present).length}/${rows.length} present)\n`)
for (const row of rows) {
  console.log(
    `${row.present ? '  present ' : '  MISSING '} ${pad(row.required ? 'required' : 'optional', 9)} ${row.path}`,
  )
}
console.log(
  `\n${missingRequired.length} required asset(s) outstanding, ${missingOptional.length} optional.\n` +
    'Missing assets render as labelled placeholders; nothing is invented in their place.\n',
)
process.exit(0)
