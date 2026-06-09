import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      ags: fileURLToPath(new URL('./packages/mock-ags', import.meta.url)),
      gnim: fileURLToPath(new URL('./packages/mock-gnim', import.meta.url)),
    },
  },
})
