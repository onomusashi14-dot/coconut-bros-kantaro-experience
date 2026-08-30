import { presentAssets, scannedAt } from 'virtual:asset-presence'

export type AssetKind = 'brand' | 'image' | 'video' | 'model' | 'audio' | 'font' | 'poster'

export interface AssetEntry {
  /** Stable key used throughout the app. */
  id: string
  /** Path relative to `public/`. This filename is contractual: drop the real
   *  file at exactly this path and the experience picks it up with no code change. */
  path: string
  kind: AssetKind
  /** Human-readable description of what belongs here. */
  description: string
  /** Expected aspect ratio, `null` for audio/model/font. */
  aspect: string | null
  /** Required for the final presentation, as opposed to an enhancement. */
  requiredForFinal: boolean
  /** Chapters that reference this asset. */
  chapters: number[]
  /** What the experience does while the asset is absent. */
  fallback: string
}

export const ASSET_MANIFEST: AssetEntry[] = [
  // ---------------------------------------------------------------- brand ---
  {
    id: 'logo-svg',
    path: 'assets/brand/coconut-bros-logo.svg',
    kind: 'brand',
    description:
      'The official standalone Coconut Bros logo (ornate gold-and-green identity), vector, transparent background, trimmed to the artwork. Must be the approved artwork — never redrawn, never a crop of a storefront photograph. The supplied 4096px PNG covers every use in this build, so vector is only needed if the mark is ever printed or scaled beyond that.',
    aspect: '≈ 2.07:1',
    requiredForFinal: false,
    chapters: [3, 5, 7],
    fallback: 'Labelled brand-slot placeholder. No logo is drawn or approximated.',
  },
  {
    id: 'logo-png',
    path: 'assets/brand/coconut-bros-logo.png',
    kind: 'brand',
    description:
      'The approved logo as a transparent PNG, at least 2048px on the long edge. Supplied at 4096×1978; this is what the signage reveal renders.',
    aspect: '≈ 2.07:1',
    requiredForFinal: true,
    chapters: [3, 5, 7],
    fallback: 'Labelled brand-slot placeholder; the 3D bottle label stays a neutral blank panel.',
  },
  {
    id: 'siam-reserve-label',
    path: 'assets/brand/siam-reserve-label.png',
    kind: 'brand',
    description:
      'Flattened Siam Reserve bottle label artwork as supplied by the designer — deep-green field, antique-gold linework, Coconut Bros logo, SIAM RESERVE wordmark, Thai seal. Unwrapped to the bottle UV. Never generate this text procedurally.',
    aspect: '≈ 2:1 label wrap',
    requiredForFinal: true,
    chapters: [5, 6, 7],
    fallback: 'Neutral blank label panel on the 3D bottle with an on-screen "label artwork pending" note.',
  },

  // --------------------------------------------------------------- images ---
  {
    id: 'img-grove',
    path: 'assets/images/nam-hom-grove.jpg',
    kind: 'image',
    description:
      'Photoreal Nam Hom grove: giant fronds, humid air, a visible cluster of young coconuts. Grounded documentary photography, not resort stock.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [1, 2],
    fallback: 'Procedural WebGL grove (fronds, haze, droplets) carries Chapter 1 on its own.',
  },
  {
    id: 'img-harvest',
    path: 'assets/images/nam-hom-harvest.jpg',
    kind: 'image',
    description: 'Skilled harvesting with a cutting pole. Real Thai smallholding, real hands.',
    aspect: '16:9',
    requiredForFinal: true,
    chapters: [2],
    fallback: 'Labelled 16:9 placeholder frame in the same composition slot.',
  },
  {
    id: 'img-selection',
    path: 'assets/images/nam-hom-selection.jpg',
    kind: 'image',
    description: 'Sorting, trimming and chilling — selection judgement and ice.',
    aspect: '16:9',
    requiredForFinal: true,
    chapters: [2],
    fallback: 'Labelled 16:9 placeholder frame in the same composition slot.',
  },
  {
    id: 'img-store',
    path: 'assets/images/bangkok-store.jpg',
    kind: 'image',
    description:
      'The Bangkok flagship storefront, straight-on, showing the outside cutting counter, the two coconut shelves and the signage in context. Supplied portrait at 1023×1537; chapters 3 and 7 are composed around that shape so the sign and pavement are never cropped away.',
    aspect: '2:3 (portrait)',
    requiredForFinal: true,
    chapters: [3, 4, 7],
    fallback: 'Labelled 16:9 placeholder frame; the procedural counter build still plays.',
  },
  {
    id: 'img-uniforms',
    path: 'assets/images/uniforms.jpg',
    kind: 'image',
    description: 'Staff uniforms and service presentation at the counter. Supplied as a four-up front/back sheet at 1662×946.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [4],
    fallback: 'Slot is omitted from the composition.',
  },

  {
    id: 'img-bottle-hero',
    path: 'assets/images/siam-reserve-bottle-hero.png',
    kind: 'image',
    description:
      'Interim raster hero of the Siam Reserve bottle — ribbed glass, condensation, printed label, Thai seal over the cap. Portrait, dark ground. Chapter 5 dissolves into this for its final hold. It is a still, not the product model: it does not replace siam-reserve-bottle.glb, and chapters 6 and 7 keep the live 3D bottle because their camera moves need one.',
    aspect: '2:3 (portrait)',
    requiredForFinal: false,
    chapters: [5],
    fallback: 'Chapter 5 holds on the live Three.js bottle instead.',
  },

  // ---------------------------------------------------------------- video ---
  {
    id: 'vid-discovery',
    path: 'assets/video/discovery.mp4',
    kind: 'video',
    description:
      'Droplet push-through: a condensation droplet holding an inverted grove reflection, camera travelling through it into the grove. H.264, 1920×1080, no burned-in text.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [1],
    fallback: 'Procedural WebGL droplet + grove sequence.',
  },
  {
    id: 'vid-provenance',
    path: 'assets/video/provenance.mp4',
    kind: 'video',
    description: 'Grow → harvest → select, connected by continuous object movement.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [2],
    fallback: 'Still-image beats with matched cropping and camera-move simulation.',
  },
  {
    id: 'vid-bangkok',
    path: 'assets/video/bangkok.mp4',
    kind: 'video',
    description: 'The storefront reveal — counter, shelves, ice, timber, street energy.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [3],
    fallback: 'Procedural counter-assembly sequence.',
  },
  {
    id: 'vid-business-ritual',
    path: 'assets/video/business-ritual.mp4',
    kind: 'video',
    description: 'The outside-facing cutting ritual, filmed from the customer side of the counter.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [4],
    fallback: 'Procedural counter plate with the SEE → STOP → WATCH → DRINK → SHARE path.',
  },
  {
    id: 'vid-bottle-transformation',
    path: 'assets/video/bottle-transformation.mp4',
    kind: 'video',
    description:
      'THE hero shot. Blender render, 18–26s: blade impact, water rising, bottle formation, label and seal reveal. Its FINAL FRAME must match the live Three.js hero composition exactly — camera, focal length, background, bottle scale, lighting. Render at 1920×1080, constant frame rate, and supply the matched still as poster.jpg.',
    aspect: '16:9',
    requiredForFinal: true,
    chapters: [5],
    fallback:
      'Procedural WebGL transformation stand-in plays the same beat structure and hands off to the same live bottle.',
  },
  {
    id: 'vid-japan-transition',
    path: 'assets/video/japan-transition.mp4',
    kind: 'video',
    description: 'Tropical green and rough wood settling into ivory, refined wood and negative space.',
    aspect: '16:9',
    requiredForFinal: false,
    chapters: [6],
    fallback: 'Live palette transition driven by the chapter timeline.',
  },

  // ---------------------------------------------------------------- model ---
  {
    id: 'model-bottle',
    path: 'assets/models/siam-reserve-bottle.glb',
    kind: 'model',
    description:
      'The Siam Reserve bottle. Draco/KTX2 compressed GLB, real-world scale in metres, Y-up, origin at the base centre. Physically based glass, separate label material carrying siam-reserve-label.png, optional condensation layer. 1K–2K textures except the label.',
    aspect: null,
    requiredForFinal: true,
    chapters: [5, 6, 7],
    fallback:
      'A clearly-labelled procedural lathe stand-in with the correct silhouette proportions and blank label panel.',
  },

  // ---------------------------------------------------------------- audio ---
  {
    id: 'aud-ambient-grove',
    path: 'assets/audio/ambient-grove.mp3',
    kind: 'audio',
    description: 'Distant natural grove ambience, leaves moving softly. Seamless, no musical melody. 60s+.',
    aspect: null,
    requiredForFinal: false,
    chapters: [1, 2],
    fallback: 'Synthesised bed at low level.',
  },
  {
    id: 'aud-bangkok-street',
    path: 'assets/audio/bangkok-street.mp3',
    kind: 'audio',
    description: 'Controlled Bangkok street ambience — presence without chaos. 60s+.',
    aspect: null,
    requiredForFinal: false,
    chapters: [3, 4],
    fallback: 'Synthesised bed at low level.',
  },
  {
    id: 'aud-coconut-cut',
    path: 'assets/audio/coconut-cut.wav',
    kind: 'audio',
    description: 'A single deep, realistic blade strike into a coconut. Dry, no reverb tail baked in.',
    aspect: null,
    requiredForFinal: false,
    chapters: [4, 5],
    fallback: 'Synthesised transient.',
  },
  {
    id: 'aud-water-rise',
    path: 'assets/audio/water-rise.wav',
    kind: 'audio',
    description: 'Expanding, rising water — the inversion of a pour.',
    aspect: null,
    requiredForFinal: false,
    chapters: [5],
    fallback: 'Synthesised rising noise bed.',
  },
  {
    id: 'aud-glass-resonance',
    path: 'assets/audio/glass-resonance.wav',
    kind: 'audio',
    description: 'Fine glass resonance for the moment the bottle solidifies.',
    aspect: null,
    requiredForFinal: false,
    chapters: [5],
    fallback: 'Synthesised bell partial.',
  },
  {
    id: 'aud-final-note',
    path: 'assets/audio/final-note.wav',
    kind: 'audio',
    description: 'One minimal final musical note. No phrase, no loop.',
    aspect: null,
    requiredForFinal: false,
    chapters: [5, 7],
    fallback: 'Synthesised sine with a long decay.',
  },

  // --------------------------------------------------------------- poster ---
  {
    id: 'poster',
    path: 'poster.jpg',
    kind: 'poster',
    description:
      'Global fallback still, and the matched last frame of bottle-transformation.mp4. Shown if any video fails to decode.',
    aspect: '16:9',
    requiredForFinal: true,
    chapters: [1, 2, 3, 4, 5, 6, 7],
    fallback: 'Deep jungle-black field.',
  },
]

const present = new Set(presentAssets)

export const ASSET_SCAN_TIME = scannedAt

export function isAssetPresent(id: string): boolean {
  const entry = ASSET_MANIFEST.find((a) => a.id === id)
  return entry ? present.has(entry.path) : false
}

/** Resolved URL for an asset, or `null` when the file is not on disk. */
export function assetUrl(id: string): string | null {
  const entry = ASSET_MANIFEST.find((a) => a.id === id)
  if (!entry || !present.has(entry.path)) return null
  return `${import.meta.env.BASE_URL}${entry.path}`
}

export function getAsset(id: string): AssetEntry {
  const entry = ASSET_MANIFEST.find((a) => a.id === id)
  if (!entry) throw new Error(`Unknown asset id: ${id}`)
  return entry
}

export interface AssetStatus extends AssetEntry {
  present: boolean
}

export function assetStatuses(): AssetStatus[] {
  return ASSET_MANIFEST.map((a) => ({ ...a, present: present.has(a.path) }))
}

export function missingRequiredAssets(): AssetStatus[] {
  return assetStatuses().filter((a) => a.requiredForFinal && !a.present)
}
