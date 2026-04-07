import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass(req) {
          // Don't proxy TypeScript source files — serve them as modules
          if (req.url?.endsWith('.ts') || req.url?.endsWith('.tsx')) {
            return req.url
          }
        }
      }
    }
  }
})
