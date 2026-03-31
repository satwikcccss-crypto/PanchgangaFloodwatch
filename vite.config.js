import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PanchgangaFloodwatch/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Enable for Google IDX and LAN access
    proxy: {
      // Proxy ThingSpeak API to avoid CORS issues
      '/api/thingspeak': {
        target: 'https://api.thingspeak.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thingspeak/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for smaller build size
    minify: 'terser', // Better compression
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    },
    // Optimize for smaller builds
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit for chunks
  },
  optimizeDeps: {
    include: ['leaflet', 'chart.js']
  }
})
