import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { kbHead } from './vite/kb-head.ts'
import { kbFrontmatter } from './vite/kb-frontmatter.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [kbFrontmatter(), react(), kbHead()],
})
