import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: '../public',
  server: {
    fs: {
      allow: ['..']
    },
    // Proxy API + action routes to Express so session auth works in dev
    proxy: {
      // Data + action routes
      '/api': 'http://localhost:3000',
      '/server-action': 'http://localhost:3000',
      '/delete-server': 'http://localhost:3000',
      '/add-domain': 'http://localhost:3000',
      '/delete-domain': 'http://localhost:3000',
      '/enable-ssl': 'http://localhost:3000',
      // Auth routes — POST submissions proxy to Express; GET is handled by React Router
      '/logout': 'http://localhost:3000',
    }
  }
})
