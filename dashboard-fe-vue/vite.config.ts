import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/AI_Healthcare_pjt1/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})