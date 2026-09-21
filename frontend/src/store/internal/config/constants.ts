import {
  getBackendUrl,
  getUniqueTestServerPort,
  parseTestPortStart,
  parseVitestId,
} from './constant-helper'

// vitest exposes the process environment through import.meta.env, so the
// values a test run sets arrive the same way the build time ones do and
// nothing here has to reach for process, which a browser does not have.
const vitestId = parseVitestId(import.meta.env.VITEST_POOL_ID)
const testPortStart = parseTestPortStart(import.meta.env.TEST_PORT_START)
const uniqueTestServerPort = getUniqueTestServerPort(vitestId, testPortStart)
const backendUrl: string = getBackendUrl(
  vitestId,
  uniqueTestServerPort,
  import.meta.env.VITE_BACKEND_URL,
)

export { backendUrl, uniqueTestServerPort }
