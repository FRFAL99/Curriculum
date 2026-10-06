import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { kbHead } from './vite/kb-head.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), kbHead()],
})
