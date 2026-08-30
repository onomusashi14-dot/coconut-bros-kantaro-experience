/// <reference types="vite/client" />

declare module 'virtual:asset-presence' {
  /** Public-relative paths (e.g. "assets/images/nam-hom-grove.jpg") that exist on disk at build time. */
  export const presentAssets: string[]
  /** ISO timestamp of the scan that produced `presentAssets`. */
  export const scannedAt: string
}
