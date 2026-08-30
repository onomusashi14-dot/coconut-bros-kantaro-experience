import type { CSSProperties } from 'react'
import { assetUrl, getAsset } from '../data/assets'

interface PlaceholderProps {
  assetId: string
  /** CSS aspect-ratio value, e.g. "16 / 9". */
  ratio?: string
  variant?: 'default' | 'brand' | 'quiet'
  style?: CSSProperties
  className?: string
  /** Drop the long description in tight compositions. */
  compact?: boolean
}

/**
 * The one honest answer to a missing asset.
 *
 * It preserves the layout and the aspect ratio, states the exact filename the
 * production asset must land at, and never approximates brand artwork. A
 * placeholder always looks like a placeholder.
 */
export function Placeholder({ assetId, ratio, variant = 'default', style, className, compact = false }: PlaceholderProps) {
  const asset = getAsset(assetId)
  const tag =
    asset.kind === 'brand'
      ? 'Brand asset required — not recreated'
      : asset.kind === 'model'
        ? 'Model placeholder'
        : `${asset.kind} placeholder`

  return (
    <div
      className={`placeholder placeholder--${variant} ${className ?? ''}`}
      style={{ aspectRatio: ratio, ...style }}
      role="img"
      aria-label={`Placeholder for ${asset.path}. ${asset.description}`}
    >
      <span className="placeholder__tag">{tag}</span>
      <span className="placeholder__name">{asset.path}</span>
      {!compact && <span className="placeholder__desc">{asset.description}</span>}
      <span className="placeholder__meta">
        {asset.aspect ? `${asset.aspect} · ` : ''}
        {asset.requiredForFinal ? 'Required for final presentation' : 'Optional enhancement'}
      </span>
    </div>
  )
}

interface AssetImageProps {
  assetId: string
  alt: string
  ratio?: string
  className?: string
  style?: CSSProperties
  /** Object-position for the centre crop. */
  position?: string
  compact?: boolean
}

/** The real image when it exists on disk; a labelled placeholder when it does not. */
export function AssetImage({
  assetId,
  alt,
  ratio = '16 / 9',
  className,
  style,
  position = 'center',
  compact,
}: AssetImageProps) {
  const url = assetUrl(assetId)
  if (!url) return <Placeholder assetId={assetId} ratio={ratio} className={className} style={style} compact={compact} />
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: position,
        aspectRatio: ratio,
        ...style,
      }}
      draggable={false}
    />
  )
}

/**
 * The brand slot. If the approved logo file is absent nothing is drawn in its
 * place — the presentation states plainly that the artwork is pending.
 */
export function BrandMark({ height = 140, className }: { height?: number; className?: string }) {
  const svg = assetUrl('logo-svg')
  const png = assetUrl('logo-png')
  const url = svg ?? png
  if (!url) {
    return (
      <div className={className} style={{ width: `min(${height * 3}px, 62vw)` }}>
        <Placeholder assetId="logo-svg" variant="brand" ratio="3 / 2" compact />
      </div>
    )
  }
  return <img src={url} alt="Coconut Bros" style={{ height, width: 'auto' }} className={className} draggable={false} />
}
