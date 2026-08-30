export interface ChapterBeat {
  /** Timeline position, in seconds from chapter start. */
  at: number
  /** How long the beat stays fully visible before the next one displaces it. */
  hold?: number
  en: string[]
  ja?: string[]
  /** Beats marked `persist` remain on screen in the hold composition. */
  persist?: boolean
  emphasis?: 'hero' | 'statement' | 'support' | 'fact'
}

export interface ChapterDef {
  index: number
  /** Two-digit marker, e.g. "01". */
  marker: string
  slug: string
  title: string
  /** Total cinematic sequence length in seconds. The chapter holds after this. */
  duration: number
  /** Ambience bed for the chapter. */
  ambience: 'grove' | 'street' | 'silence' | 'refined'
  /** Palette applied to the stage while the chapter is active. */
  palette: 'jungle' | 'street' | 'void' | 'ivory'
  /** Presenter-facing one line summary, shown in the Escape overlay. */
  presenterNote: string
}

export const CHAPTERS: ChapterDef[] = [
  {
    index: 1,
    marker: '01',
    slug: 'discovery',
    title: 'DISCOVERY',
    duration: 16,
    ambience: 'grove',
    palette: 'jungle',
    presenterNote: 'Nam Hom is a specific Thai coconut, not a generic category.',
  },
  {
    index: 2,
    marker: '02',
    slug: 'provenance',
    title: 'PROVENANCE',
    duration: 20,
    ambience: 'grove',
    palette: 'jungle',
    presenterNote: 'Aroma, sweetness and freshness are decided in the grove, not the factory.',
  },
  {
    index: 3,
    marker: '03',
    slug: 'bangkok',
    title: 'BANGKOK',
    duration: 20,
    ambience: 'street',
    palette: 'street',
    presenterNote: 'One product, one visible ritual, one unforgettable Bangkok experience.',
  },
  {
    index: 4,
    marker: '04',
    slug: 'business-model',
    title: 'BUSINESS MODEL',
    duration: 26,
    ambience: 'street',
    palette: 'street',
    presenterNote: 'The flagship is a proving ground: outside ordering, live cutting, fast conversion.',
  },
  {
    index: 5,
    marker: '05',
    slug: 'siam-reserve',
    title: 'SIAM RESERVE',
    duration: 24,
    ambience: 'silence',
    palette: 'void',
    presenterNote: 'Say nothing during this chapter. Let the reveal land, then hold in silence.',
  },
  {
    index: 6,
    marker: '06',
    slug: 'japan',
    title: 'JAPAN',
    duration: 26,
    ambience: 'refined',
    palette: 'ivory',
    presenterNote: 'Bangkok creates the legend; Siam Reserve carries it. Validation is proposed, not claimed.',
  },
  {
    index: 7,
    marker: '07',
    slug: 'partnership',
    title: 'FOUNDING PARTNERSHIP',
    duration: 30,
    ambience: 'refined',
    palette: 'ivory',
    presenterNote: 'Authorship, judgment, guardianship, recognition, discipline. Then stop and discuss.',
  },
]

export const CHAPTER_COUNT = CHAPTERS.length

export function chapterAt(index: number): ChapterDef {
  return CHAPTERS[Math.min(Math.max(index, 0), CHAPTERS.length - 1)]
}
