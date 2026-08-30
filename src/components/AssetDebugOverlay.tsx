import { useEffect, useState } from 'react'
import { ASSET_SCAN_TIME, assetStatuses } from '../data/assets'

/** Development-only asset status board, reachable at `?debug=assets`. */
export function AssetDebugOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setOpen(params.get('debug') === 'assets')
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [open])

  if (!open) return null
  const rows = assetStatuses()
  const missingRequired = rows.filter((r) => !r.present && r.requiredForFinal).length

  return (
    <div className="assets-overlay">
      <h1>Asset manifest</h1>
      <p className="sub">
        {rows.filter((r) => r.present).length} of {rows.length} present · {missingRequired} required
        {missingRequired === 1 ? ' asset' : ' assets'} outstanding · scanned {new Date(ASSET_SCAN_TIME).toLocaleString()}
        . Press Escape to close.
      </p>
      <table className="assets-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Path</th>
            <th>Type</th>
            <th>Aspect</th>
            <th>Final</th>
            <th>Chapters</th>
            <th>What belongs here / fallback in use</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <span className={`pill ${row.present ? 'pill--present' : 'pill--missing'}`}>
                  {row.present ? 'Present' : 'Missing'}
                </span>
              </td>
              <td>
                <code>{row.path}</code>
              </td>
              <td>{row.kind}</td>
              <td>{row.aspect ?? '—'}</td>
              <td>
                <span className={`pill ${row.requiredForFinal ? 'pill--required' : 'pill--optional'}`}>
                  {row.requiredForFinal ? 'Required' : 'Optional'}
                </span>
              </td>
              <td>{row.chapters.join(', ')}</td>
              <td className="desc">
                {row.description}
                {!row.present && <div style={{ marginTop: 8, color: 'var(--antique-gold)' }}>Fallback: {row.fallback}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
