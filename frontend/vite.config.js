import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // Needed for Docker port mapping
    strictPort: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Local dev or docker service name
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
