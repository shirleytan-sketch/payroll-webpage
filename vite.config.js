import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project site on GitHub Pages (shirleytan-sketch.github.io/payroll-webpage/)
// needs the base path to match the repo name.
export default defineConfig({
  base: '/payroll-webpage/',
  plugins: [react()],
})
