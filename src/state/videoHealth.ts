import { useSyncExternalStore } from 'react'

/**
 * Runtime health of the cinematic clips.
 *
 * A clip can be on disk and still refuse to decode on the presentation laptop.
 * When that happens the chapter has to fall back to its WebGL rendering
 * immediately and silently, so both the DOM layer and the WebGL layer read the
 * same flag.
 */
const failed = new Set<string>()
const listeners = new Set<() => void>()

export function markVideoFailed(assetId: string) {
  if (failed.has(assetId)) return
  failed.add(assetId)
  listeners.forEach((listener) => listener())
}

export function resetVideo(assetId: string) {
  if (!failed.delete(assetId)) return
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useVideoHealthy(assetId: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !failed.has(assetId),
    () => true,
  )
}

export function anyVideoFailed(): boolean {
  return failed.size > 0
}
