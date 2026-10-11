import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This is a GitHub Pages user site, served at the root domain.
export default defineConfig({ plugins: [react()], base: '/' })
