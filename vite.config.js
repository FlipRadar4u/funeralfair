import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind handled via PostCSS (postcss.config.mjs) — compatible with Vite 8 / rolldown
export default defineConfig({
  plugins: [react()],
})
