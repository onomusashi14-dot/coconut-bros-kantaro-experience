import { getAsset } from '../data/assets'

/**
 * A discreet, permanent reminder that what is on screen is a stand-in.
 *
 * Used where a placeholder cannot be drawn as a labelled box — a 3D model, a
 * label texture — so that nothing in this build can be mistaken for the
 * finished product during a live viewing.
 */
export function PendingAssetNote({ assetIds, side = 'right' }: { assetIds: string[]; side?: 'left' | 'right' }) {
  const pending = assetIds.map(getAsset)
  if (pending.length === 0) return null
  return (
    <p
      style={{
        position: 'absolute',
        [side]: 'var(--edge)',
        bottom: 'calc(var(--edge) * 0.55)',
        zIndex: 7,
        margin: 0,
        fontSize: 14,
        lineHeight: 1.5,
        letterSpacing: '0.06em',
        color: 'var(--stage-fg-soft)',
        textAlign: side,
        maxWidth: '34ch',
        opacity: 0.62,
      }}
    >
      Stand-in — awaiting {pending.map((a) => a.path).join(' and ')}
    </p>
  )
}
