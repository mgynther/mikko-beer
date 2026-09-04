import { defineConfig } from 'vitest/config'

const exclude = ['e2e', 'node_modules']

// Component tests are .tsx by convention and need a DOM. theme-applier is the
// one plain .ts test that manipulates document.
const domTests = ['**/*.test.tsx', 'src/theme-applier.test.ts']

// Constructing a jsdom instance costs about a second per test file so the
// tests that do not need one run in the node environment instead.
const nonDomTests = ['**/*.test.ts']

const shared = {
  globals: true,
  pool: 'threads',
} as const

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          ...shared,
          name: 'dom',
          environment: 'jsdom',
          include: domTests,
          exclude,
        },
      },
      {
        test: {
          ...shared,
          name: 'node',
          environment: 'node',
          include: nonDomTests,
          exclude: [...exclude, ...domTests],
        },
      },
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/**/*.css', 'src/react-redux-wrapper.ts'],
      skipFull: true,
      thresholds: {
        statements: 100,
        functions: 100,
        branches: 100,
        lines: 100,
      },
    },
  },
})
