import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      ags: fileURLToPath(new URL('./test/mocks/ags.ts', import.meta.url)),
      gnim: fileURLToPath(new URL('./test/mocks/gnim.ts', import.meta.url)),
    },
  },
})
