import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['e2e', 'node_modules'],
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/**/*.css', 'src/react-redux-wrapper.ts'],
      thresholds: {
        statements: 100,
        functions: 100,
        branches: 100,
        lines: 100
      }
    }
  },
})
