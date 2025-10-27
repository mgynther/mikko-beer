function getTestPortStart(): number {
  try {
    const startPort: string | undefined = process.env.TEST_PORT_START
    if (startPort === undefined || startPort === '') {
      return -1
    }
    return parseInt(startPort, 10)
  } catch {
    return -1
  }
}

function getVitestId(): number {
  try {
    const workerId = process.env.VITEST_WORKER_ID
    if (workerId === undefined || workerId === '') {
      return -1
    }
    return parseInt(workerId, 10)
  } catch {
    return -1
  }
}
const vitestId = getVitestId()
const uniqueTestServerPort = vitestId > -1 ? (getTestPortStart() + vitestId) : 0

function getUrl (): string {
  if (vitestId > -1) {
    return `http://localhost:${uniqueTestServerPort}`
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * env variables seem to be considered any.
   */
  return (import.meta.env.VITE_BACKEND_URL as unknown as string | undefined)
    ?? 'http://localhost:3001'
}
const backendUrl: string = getUrl()

export {
  backendUrl,
  uniqueTestServerPort
}
