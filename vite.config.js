import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // The GitHub Pages site is served from /project-athena/, not the domain
  // root, so built asset URLs need that prefix. Local dev stays at "/".
  base: process.env.GITHUB_PAGES === 'true' ? '/project-athena/' : '/',
  plugins: [react(), tailwindcss()],
})
