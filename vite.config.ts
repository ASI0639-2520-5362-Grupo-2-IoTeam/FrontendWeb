import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vue-vendor';
            }
            if (id.includes('primevue') || id.includes('primeicons')) {
              return 'primevue-vendor';
            }
            if (id.includes('pinia')) {
              return 'pinia-vendor';
            }
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'https://plantcare-awcchhb2bfg3hxgf.canadacentral-01.azurewebsites.net',
          //target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
