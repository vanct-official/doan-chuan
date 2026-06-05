import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: [
        'Chrome >= 92',
        'iOS >= 12',
        'Safari >= 12'
      ],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime'
      ],
      renderLegacyChunks: true,
      modernPolyfills: true
    })
  ],
  build: {
    target: 'es2015' // cực kỳ quan trọng
  }
})