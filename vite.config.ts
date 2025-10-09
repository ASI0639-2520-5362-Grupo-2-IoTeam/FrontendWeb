import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://fakeapiplant.vercel.app',
        changeOrigin: true,
        secure: true,
        ws: false,
        // remove the /api prefix when forwarding to the target
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
