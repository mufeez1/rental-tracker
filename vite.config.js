import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so it works on any host/path. PWA is provided via a hand-written
// manifest (public/manifest.webmanifest) and service worker (public/sw.js).
export default defineConfig({
  base: './',
  plugins: [react()],
})
