import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:asset-presence'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/**
 * Scans `public/` once per dev-server start and once per build, and exposes the
 * result as a virtual module.
 *
 * The experience must never issue a network request for an asset that does not
 * exist — a missing asset has to resolve to a labelled placeholder, not a 404 in
 * the console during a live presentation. Knowing the file list at build time is
 * what makes that possible offline.
 */
export function assetPresence(publicDir = 'public'): Plugin {
  const root = path.resolve(process.cwd(), publicDir)

  function scan(dir: string, base = ''): string[] {
    if (!fs.existsSync(dir)) return []
    const out: string[] = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const rel = base ? `${base}/${entry.name}` : entry.name
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        out.push(...scan(abs, rel))
      } else if (entry.isFile()) {
        // A zero-byte file is a reserved slot, not a usable asset.
        if (fs.statSync(abs).size > 0) out.push(rel)
      }
    }
    return out
  }

  return {
    name: 'coconut-bros:asset-presence',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      const files = scan(root).sort()
      return [
        `export const presentAssets = ${JSON.stringify(files)};`,
        `export const scannedAt = ${JSON.stringify(new Date().toISOString())};`,
      ].join('\n')
    },
    configureServer(server) {
      const invalidate = (file: string) => {
        if (!file.startsWith(root)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', invalidate)
      server.watcher.on('unlink', invalidate)
    },
  }
}
