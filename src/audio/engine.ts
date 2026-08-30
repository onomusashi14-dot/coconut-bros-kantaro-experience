import { assetUrl } from '../data/assets'

export type Ambience = 'grove' | 'street' | 'refined' | 'silence'
export type Cue = 'droplet' | 'coconut-cut' | 'water-rise' | 'glass-resonance' | 'final-note'

const AMBIENCE_ASSET: Record<Exclude<Ambience, 'silence'>, string | null> = {
  grove: 'aud-ambient-grove',
  street: 'aud-bangkok-street',
  refined: null, // deliberate: the Japan chapters live on near-silence
}

const CUE_ASSET: Record<Cue, string | null> = {
  droplet: null,
  'coconut-cut': 'aud-coconut-cut',
  'water-rise': 'aud-water-rise',
  'glass-resonance': 'aud-glass-resonance',
  'final-note': 'aud-final-note',
}

const AMBIENCE_LEVEL: Record<Ambience, number> = {
  grove: 0.24,
  street: 0.2,
  refined: 0.08,
  silence: 0,
}

interface Bed {
  gain: GainNode
  stop: () => void
}

/**
 * Audio is an accompaniment, never a dependency. Every path here is wrapped so
 * that a blocked AudioContext, a missing file or an unsupported codec degrades
 * to silence rather than interrupting a live presentation.
 *
 * Where a recorded bed is missing, a restrained synthesised texture stands in.
 * It is deliberately plain — it holds the space for the real recording without
 * pretending to be one, and it never resolves into a repeating musical phrase.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambienceGain: GainNode | null = null
  private current: Ambience = 'silence'
  private bed: Bed | null = null
  private buffers = new Map<string, AudioBuffer | null>()
  private muted = false
  private duck = 1
  private failed = false

  get available() {
    return this.ctx !== null && !this.failed
  }

  /** Must be called from a user gesture so the browser will allow playback. */
  async unlock(): Promise<void> {
    if (this.ctx || this.failed) return
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) {
        this.failed = true
        return
      }
      const ctx = new Ctor()
      await ctx.resume()
      const master = ctx.createGain()
      master.gain.value = 1
      master.connect(ctx.destination)
      const ambience = ctx.createGain()
      ambience.gain.value = 0
      ambience.connect(master)
      this.ctx = ctx
      this.master = master
      this.ambienceGain = ambience
    } catch {
      this.failed = true
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    this.applyLevel(0.4)
  }

  /** Pulls ambience down beneath the presenter's voice during hold states. */
  setDuck(amount: number) {
    this.duck = Math.min(Math.max(amount, 0), 1)
    this.applyLevel(1.2)
  }

  private applyLevel(seconds: number) {
    if (!this.ctx || !this.ambienceGain) return
    const level = this.muted ? 0 : AMBIENCE_LEVEL[this.current] * this.duck
    const now = this.ctx.currentTime
    try {
      this.ambienceGain.gain.cancelScheduledValues(now)
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, now)
      this.ambienceGain.gain.linearRampToValueAtTime(level, now + seconds)
    } catch {
      /* ignore */
    }
  }

  /** Crossfades to a new sound environment. */
  async setAmbience(next: Ambience) {
    if (!this.ctx || this.current === next) {
      this.current = next
      this.applyLevel(1.6)
      return
    }
    this.current = next
    const previous = this.bed
    this.bed = null

    if (previous) {
      const ctx = this.ctx
      const now = ctx.currentTime
      try {
        previous.gain.gain.cancelScheduledValues(now)
        previous.gain.gain.setValueAtTime(previous.gain.gain.value, now)
        previous.gain.gain.linearRampToValueAtTime(0, now + 1.4)
      } catch {
        /* ignore */
      }
      window.setTimeout(() => previous.stop(), 1700)
    }

    if (next === 'silence') {
      this.applyLevel(1.4)
      return
    }
    this.bed = await this.createBed(next)
    this.applyLevel(1.8)
  }

  private async createBed(kind: Exclude<Ambience, 'silence'>): Promise<Bed | null> {
    if (!this.ctx || !this.ambienceGain) return null
    const ctx = this.ctx
    const gain = ctx.createGain()
    gain.gain.value = 1
    gain.connect(this.ambienceGain)

    const assetId = AMBIENCE_ASSET[kind]
    const buffer = assetId ? await this.load(assetId) : null

    if (buffer) {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gain)
      source.start()
      return { gain, stop: () => stopSafely(source, gain) }
    }

    // Synthesised stand-in: filtered noise with a slowly wandering filter, so it
    // never settles into an identifiable loop.
    const noise = createNoiseSource(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = kind === 'street' ? 900 : kind === 'grove' ? 1500 : 500
    filter.Q.value = 0.6
    const lfo = ctx.createOscillator()
    lfo.frequency.value = kind === 'grove' ? 0.06 : 0.03
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = kind === 'grove' ? 520 : 220
    lfo.connect(lfoGain).connect(filter.frequency)
    noise.connect(filter).connect(gain)
    noise.start()
    lfo.start()
    return {
      gain,
      stop: () => {
        stopSafely(noise, gain)
        stopSafely(lfo, null)
      },
    }
  }

  /** One-shot sound design event. Missing files fall back to a synthesised transient. */
  async play(cue: Cue, volume = 0.6) {
    if (!this.ctx || !this.master || this.muted) return
    const ctx = this.ctx
    const assetId = CUE_ASSET[cue]
    const buffer = assetId ? await this.load(assetId) : null
    const gain = ctx.createGain()
    gain.gain.value = volume
    gain.connect(this.master)

    if (buffer) {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(gain)
      source.start()
      source.onended = () => gain.disconnect()
      return
    }
    synthesiseCue(ctx, gain, cue)
  }

  private async load(assetId: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(assetId)) return this.buffers.get(assetId) ?? null
    const url = assetUrl(assetId)
    if (!url || !this.ctx) {
      this.buffers.set(assetId, null)
      return null
    }
    try {
      const response = await fetch(url)
      const bytes = await response.arrayBuffer()
      const decoded = await this.ctx.decodeAudioData(bytes)
      this.buffers.set(assetId, decoded)
      return decoded
    } catch {
      this.buffers.set(assetId, null)
      return null
    }
  }

  dispose() {
    this.bed?.stop()
    this.bed = null
    try {
      void this.ctx?.close()
    } catch {
      /* ignore */
    }
    this.ctx = null
  }
}

function stopSafely(node: AudioScheduledSourceNode, gain: GainNode | null) {
  try {
    node.stop()
  } catch {
    /* already stopped */
  }
  try {
    node.disconnect()
    gain?.disconnect()
  } catch {
    /* ignore */
  }
}

function createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const seconds = 6
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    // Brown-ish noise reads as air rather than as hiss.
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

function synthesiseCue(ctx: AudioContext, out: GainNode, cue: Cue) {
  const now = ctx.currentTime
  switch (cue) {
    case 'droplet':
    case 'coconut-cut': {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      const isCut = cue === 'coconut-cut'
      osc.frequency.setValueAtTime(isCut ? 220 : 900, now)
      osc.frequency.exponentialRampToValueAtTime(isCut ? 60 : 260, now + (isCut ? 0.22 : 0.12))
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, now)
      env.gain.exponentialRampToValueAtTime(1, now + 0.006)
      env.gain.exponentialRampToValueAtTime(0.0001, now + (isCut ? 0.5 : 0.24))
      osc.connect(env).connect(out)
      osc.start(now)
      osc.stop(now + 0.7)
      break
    }
    case 'water-rise': {
      const noise = createNoiseSource(ctx)
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.Q.value = 1.2
      filter.frequency.setValueAtTime(240, now)
      filter.frequency.exponentialRampToValueAtTime(2600, now + 2.4)
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, now)
      env.gain.linearRampToValueAtTime(1, now + 1.2)
      env.gain.linearRampToValueAtTime(0.0001, now + 2.8)
      noise.connect(filter).connect(env).connect(out)
      noise.start(now)
      noise.stop(now + 3)
      break
    }
    case 'glass-resonance': {
      ;[1, 2.71, 5.42].forEach((ratio, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = 660 * ratio
        const env = ctx.createGain()
        env.gain.setValueAtTime(0.0001, now)
        env.gain.exponentialRampToValueAtTime(0.5 / (i + 1), now + 0.01)
        env.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 - i * 0.5)
        osc.connect(env).connect(out)
        osc.start(now)
        osc.stop(now + 2.6)
      })
      break
    }
    case 'final-note': {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 174.61
      const partial = ctx.createOscillator()
      partial.type = 'sine'
      partial.frequency.value = 349.23
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, now)
      env.gain.exponentialRampToValueAtTime(0.7, now + 0.08)
      env.gain.exponentialRampToValueAtTime(0.0001, now + 5.5)
      osc.connect(env)
      partial.connect(env)
      env.connect(out)
      osc.start(now)
      partial.start(now)
      osc.stop(now + 6)
      partial.stop(now + 6)
      break
    }
  }
}
