import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: 'manifest.json',
  },
  plugins: [react()],
  server: {
    forwardConsole: true
  }
})
