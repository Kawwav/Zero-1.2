import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Site--Zero/',
  server: {
    watch: {
      usePolling: true, 
    }
  }
})