import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['e2e', 'node_modules'],
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html'],
    }
  },
})
