import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const nominatimProxy = {
  '/api/nominatim': {
    target: 'https://nominatim.openstreetmap.org',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
    headers: {
      'User-Agent': 'journeySafe/1.0 (contact: dev@journeysafe.local)',
    },
  },
  '/api/overpass': {
    target: 'https://overpass-api.de',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/overpass/, '/api'),
  },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: nominatimProxy,
  },
  preview: {
    proxy: nominatimProxy,
  },
})
