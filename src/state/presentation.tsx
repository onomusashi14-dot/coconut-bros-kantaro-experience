import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { CHAPTERS, CHAPTER_COUNT, chapterAt, type ChapterDef } from '../data/chapters'

export type Phase = 'entering' | 'sequence' | 'holding' | 'exiting'
export type Mode = 'present' | 'scroll'

/** Entrance and exit transition lengths, in milliseconds. */
export const ENTRANCE_MS = 900
export const EXIT_MS = 520

interface State {
  chapter: number // 0-based
  pending: number | null // chapter being transitioned to during 'exiting'
  direction: 1 | -1
  phase: Phase
  elapsed: number // seconds into the cinematic sequence
  playing: boolean
  muted: boolean
  overlay: boolean
  started: boolean
}

type Action =
  | { type: 'begin' }
  | { type: 'request'; chapter: number }
  | { type: 'jump'; chapter: number }
  | { type: 'commit' }
  | { type: 'entered' }
  | { type: 'tick'; delta: number; duration: number }
  | { type: 'seek'; elapsed: number; duration: number }
  | { type: 'setPlaying'; playing: boolean }
  | { type: 'complete' }
  | { type: 'toggleMute' }
  | { type: 'setMuted'; muted: boolean }
  | { type: 'toggleOverlay' }
  | { type: 'setOverlay'; open: boolean }

const initialState: State = {
  chapter: 0,
  pending: null,
  direction: 1,
  phase: 'entering',
  elapsed: 0,
  playing: false,
  muted: false,
  overlay: false,
  started: false,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'begin':
      return { ...state, started: true, phase: 'entering', elapsed: 0 }

    case 'request': {
      const target = Math.min(Math.max(action.chapter, 0), CHAPTER_COUNT - 1)
      if (target === state.chapter && state.pending === null) return state
      if (state.pending !== null) return state // a transition is already running
      return {
        ...state,
        pending: target,
        direction: target > state.chapter ? 1 : -1,
        phase: 'exiting',
        playing: false,
      }
    }

    // Used only by the development scroll mode, where a 520ms exit transition
    // would fight the scrollbar.
    case 'jump': {
      const target = Math.min(Math.max(action.chapter, 0), CHAPTER_COUNT - 1)
      if (target === state.chapter) return state
      return { ...state, chapter: target, pending: null, phase: 'sequence', playing: false, elapsed: 0 }
    }

    case 'commit':
      if (state.pending === null) return state
      return { ...state, chapter: state.pending, pending: null, phase: 'entering', elapsed: 0 }

    case 'entered':
      if (state.phase !== 'entering') return state
      return { ...state, phase: 'sequence', playing: true }

    case 'tick': {
      if (state.phase !== 'sequence' || !state.playing) return state
      const elapsed = state.elapsed + action.delta
      if (elapsed >= action.duration) {
        return { ...state, elapsed: action.duration, phase: 'holding', playing: false }
      }
      return { ...state, elapsed }
    }

    case 'seek': {
      const elapsed = Math.min(Math.max(action.elapsed, 0), action.duration)
      const done = elapsed >= action.duration
      return {
        ...state,
        elapsed,
        phase: state.phase === 'exiting' || state.phase === 'entering' ? state.phase : done ? 'holding' : 'sequence',
      }
    }

    case 'setPlaying': {
      // Replaying a chapter that has already settled restarts its sequence.
      if (action.playing && state.phase === 'holding') {
        return { ...state, phase: 'sequence', elapsed: 0, playing: true }
      }
      if (state.phase !== 'sequence') return state
      return { ...state, playing: action.playing }
    }

    case 'complete':
      return { ...state, elapsed: Number.POSITIVE_INFINITY, phase: 'holding', playing: false }

    case 'toggleMute':
      return { ...state, muted: !state.muted }

    case 'setMuted':
      return { ...state, muted: action.muted }

    case 'toggleOverlay':
      return { ...state, overlay: !state.overlay }

    case 'setOverlay':
      return { ...state, overlay: action.open }

    default:
      return state
  }
}

export interface PresentationApi {
  chapter: ChapterDef
  chapterIndex: number
  direction: 1 | -1
  phase: Phase
  /** Seconds into the current cinematic sequence. Clamped to the chapter duration. */
  elapsed: number
  /** 0..1 across the cinematic sequence. */
  progress: number
  playing: boolean
  muted: boolean
  overlay: boolean
  started: boolean
  mode: Mode
  reducedMotion: boolean
  /** True once the chapter has settled and is waiting for the presenter. */
  held: boolean
  begin: () => void
  next: () => void
  prev: () => void
  goTo: (indexZeroBased: number) => void
  replay: () => void
  togglePlay: () => void
  toggleMute: () => void
  setOverlay: (open: boolean) => void
  toggleOverlay: () => void
  toggleFullscreen: () => void
  skipToHold: () => void
  seek: (seconds: number) => void
  jumpTo: (indexZeroBased: number) => void
}

const PresentationContext = createContext<PresentationApi | null>(null)

function readMode(): Mode {
  if (typeof window === 'undefined') return 'present'
  return new URLSearchParams(window.location.search).get('mode') === 'scroll' ? 'scroll' : 'present'
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const mode = useMemo(readMode, [])
  const reducedMotion = useMemo(prefersReducedMotion, [])

  const current = chapterAt(state.chapter)
  const duration = current.duration

  // --- transition scheduling ------------------------------------------------
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    if (state.phase === 'exiting') {
      clearTimers()
      schedule(() => dispatch({ type: 'commit' }), reducedMotion ? 0 : EXIT_MS)
    } else if (state.phase === 'entering' && state.started) {
      clearTimers()
      schedule(() => dispatch({ type: 'entered' }), reducedMotion ? 0 : ENTRANCE_MS)
    }
  }, [state.phase, state.started, reducedMotion])

  // Reduced motion replaces the cinematic sequence with its settled composition.
  useEffect(() => {
    if (reducedMotion && state.phase === 'sequence') dispatch({ type: 'complete' })
  }, [reducedMotion, state.phase])

  // --- clock ----------------------------------------------------------------
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  useEffect(() => {
    if (mode === 'scroll') return
    if (state.phase !== 'sequence' || !state.playing || !state.started) return

    lastRef.current = performance.now()
    const loop = (now: number) => {
      // The sequence already pauses when the page is hidden, so this clamp only
      // has to absorb a stalled frame — generous enough to keep chapter timing
      // close to wall-clock on a slow machine, small enough that nothing jumps.
      const delta = Math.min((now - lastRef.current) / 1000, 0.25)
      lastRef.current = now
      dispatch({ type: 'tick', delta, duration })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [state.phase, state.playing, state.started, duration, mode])

  // Pause the sequence while the page is hidden, so nothing is missed offscreen.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) dispatch({ type: 'setPlaying', playing: false })
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // --- api ------------------------------------------------------------------
  const goTo = useCallback((index: number) => dispatch({ type: 'request', chapter: index }), [])
  const next = useCallback(() => dispatch({ type: 'request', chapter: state.chapter + 1 }), [state.chapter])
  const prev = useCallback(() => dispatch({ type: 'request', chapter: state.chapter - 1 }), [state.chapter])

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement
    if (!document.fullscreenElement) void el.requestFullscreen?.().catch(() => undefined)
    else void document.exitFullscreen?.().catch(() => undefined)
  }, [])

  const elapsed = Math.min(state.elapsed, duration)

  const api: PresentationApi = {
    chapter: current,
    chapterIndex: state.chapter,
    direction: state.direction,
    phase: state.phase,
    elapsed,
    progress: duration > 0 ? Math.min(elapsed / duration, 1) : 1,
    playing: state.playing,
    muted: state.muted,
    overlay: state.overlay,
    started: state.started,
    mode,
    reducedMotion,
    held: state.phase === 'holding',
    begin: useCallback(() => dispatch({ type: 'begin' }), []),
    next,
    prev,
    goTo,
    replay: useCallback(() => dispatch({ type: 'setPlaying', playing: true }), []),
    togglePlay: useCallback(
      () => dispatch({ type: 'setPlaying', playing: !state.playing }),
      [state.playing],
    ),
    toggleMute: useCallback(() => dispatch({ type: 'toggleMute' }), []),
    setOverlay: useCallback((open: boolean) => dispatch({ type: 'setOverlay', open }), []),
    toggleOverlay: useCallback(() => dispatch({ type: 'toggleOverlay' }), []),
    toggleFullscreen,
    skipToHold: useCallback(() => dispatch({ type: 'complete' }), []),
    seek: useCallback((seconds: number) => dispatch({ type: 'seek', elapsed: seconds, duration }), [duration]),
    jumpTo: useCallback((index: number) => dispatch({ type: 'jump', chapter: index }), []),
  }

  return <PresentationContext.Provider value={api}>{children}</PresentationContext.Provider>
}

export function usePresentation(): PresentationApi {
  const ctx = useContext(PresentationContext)
  if (!ctx) throw new Error('usePresentation must be used inside <PresentationProvider>')
  return ctx
}

export { CHAPTERS, CHAPTER_COUNT }
