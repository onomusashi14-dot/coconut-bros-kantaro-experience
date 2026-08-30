import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { assetPresence } from './vite-plugins/asset-presence'

export default defineConfig({
  // Relative base so `dist/` can be opened from a file:// URL or any static
  // folder on the presentation laptop, with no server and no network.
  base: './',
  plugins: [react(), assetPresence()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2400,
    rollupOptions: {
      output: {
        // Split the heavy renderer and animation code out of the entry chunk so
        // the opening screen paints before they finish parsing.
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('framer-motion')) return 'motion'
          return undefined
        },
      },
    },
  },
  server: { host: '127.0.0.1', port: 5173 },
})
