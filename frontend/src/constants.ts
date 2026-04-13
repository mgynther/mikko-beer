import {
  getBackendUrl,
  getUniqueTestServerPort,
  parseTestPortStart,
  parseVitestId
} from './constant-helper'

function getTestPortStart(): number {
  try {
    return parseTestPortStart(process.env.TEST_PORT_START)
  } catch {
    // v8 ignore next -- cannot reach in Node but is needed for browser.
    return -1
  }
}

function getVitestId(): number {
  try {
    return parseVitestId(process.env.VITEST_WORKER_ID)
  } catch {
    // v8 ignore next -- cannot reach in Node but is needed for browser.
    return -1
  }
}

const vitestId = getVitestId()
const testPortStart = getTestPortStart()
const uniqueTestServerPort = getUniqueTestServerPort(vitestId, testPortStart)

function getUrl (): string {
  return getBackendUrl(vitestId, uniqueTestServerPort)
}
const backendUrl: string = getUrl()

export {
  backendUrl,
  uniqueTestServerPort
}
