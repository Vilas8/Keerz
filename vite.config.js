import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        keep_fnames: true,
        keep_classnames: true,
      },
    },
  }
})

