import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // Local stand-in for the same-origin /api/* routing Azure Static Web Apps
  // does in production, so the app never needs to know its own base URL.
  server: {
    proxy: {
      '/api': 'http://localhost:7071',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://localhost:7071',
    },
  },
})
