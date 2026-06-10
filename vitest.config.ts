import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      ags: fileURLToPath(new URL('./packages/mock-ags', import.meta.url)),
      gnim: fileURLToPath(new URL('./packages/mock-gnim', import.meta.url)),
      // Map gi:// Astal typelibs used in source to local vendor mocks for tests
      'gi://AstalHyprland?version=0.1': fileURLToPath(new URL('./packages/mock-gnim/AstalHyprland', import.meta.url)),
      'gi://AstalBluetooth?version=0.1': fileURLToPath(new URL('./packages/mock-gnim/AstalBluetooth', import.meta.url)),
      'gi://AstalWp?version=0.1': fileURLToPath(new URL('./packages/mock-gnim/AstalWp', import.meta.url)),
      'gi://AstalBattery?version=0.1': fileURLToPath(new URL('./packages/mock-gnim/AstalBattery', import.meta.url)),
    },
  },
})
