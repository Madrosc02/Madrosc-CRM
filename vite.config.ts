import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    // PWA DISABLED — the service worker was caching old broken JS bundles
    // and serving them on refresh, causing data to vanish after login.
    // Re-enable once the core data flow is stable.
  ],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})
