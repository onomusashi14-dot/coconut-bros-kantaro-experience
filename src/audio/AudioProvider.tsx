import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { AudioEngine, type Cue } from './engine'
import { usePresentation } from '../state/presentation'

interface AudioApi {
  cue: (cue: Cue, volume?: number) => void
  unlock: () => Promise<void>
}

const AudioContextValue = createContext<AudioApi | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null)
  if (engineRef.current === null) engineRef.current = new AudioEngine()
  const engine = engineRef.current

  const { chapter, muted, started, held, phase } = usePresentation()

  useEffect(() => () => engine.dispose(), [engine])

  useEffect(() => {
    if (!started) return
    void engine.setAmbience(chapter.ambience)
  }, [engine, started, chapter.ambience])

  useEffect(() => {
    engine.setMuted(muted)
  }, [engine, muted])

  // Duck beneath the presenter during hold states and entrances; the room needs
  // to be quiet enough to talk over.
  useEffect(() => {
    engine.setDuck(held ? 0.42 : phase === 'entering' ? 0.6 : 1)
  }, [engine, held, phase])

  const api = useMemo<AudioApi>(
    () => ({
      cue: (cue, volume) => void engine.play(cue, volume),
      unlock: () => engine.unlock(),
    }),
    [engine],
  )

  return <AudioContextValue.Provider value={api}>{children}</AudioContextValue.Provider>
}

export function useAudio(): AudioApi {
  const ctx = useContext(AudioContextValue)
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>')
  return ctx
}

/** Fires a one-shot cue exactly once, when the chapter clock passes `at`. */
export function useCueAt(at: number, cue: Cue, volume = 0.6) {
  const { elapsed, phase } = usePresentation()
  const { cue: play } = useAudio()
  const firedRef = useRef(false)

  useEffect(() => {
    if (phase === 'entering' || phase === 'exiting') firedRef.current = false
  }, [phase])

  useEffect(() => {
    if (firedRef.current) return
    if (phase !== 'sequence') return
    if (elapsed >= at) {
      firedRef.current = true
      play(cue, volume)
    }
  }, [elapsed, at, phase, play, cue, volume])
}
