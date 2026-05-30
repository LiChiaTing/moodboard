import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forwards the backend "doorways" to the teammates' server on :3000.
    // Lets the frontend call '/upload', '/status', etc. with no CORS issues.
    // Only matters once api.js flips USE_MOCK to false — harmless until then.
    proxy: {
      '/upload':  'http://localhost:3000',
      '/status':  'http://localhost:3000',
      '/auth':    'http://localhost:3000',
      '/callback':'http://localhost:3000',
      '/session': 'http://localhost:3000',
      '/curate':  'http://localhost:3000',
    },
  },
})
