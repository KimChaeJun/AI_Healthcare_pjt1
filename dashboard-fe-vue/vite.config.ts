import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/smoking-health-dashboard-dynamic/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})