import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${backendPort}`,
    },
  },
})
