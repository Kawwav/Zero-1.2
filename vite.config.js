import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Zero-1.2/', 
  server: {
    watch: {
      usePolling: true, 
    }
  }
})