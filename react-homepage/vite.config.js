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
      // Auth routes — so login/logout work through the Vite dev URL
      '/login': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
    }
  }
})
