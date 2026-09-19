export function parseTestPortStart(startPort: string | undefined): number {
  if (startPort === undefined || startPort === '') {
    return -1
  }
  return parseInt(startPort, 10)
}

export function parseVitestId(workerId: string | undefined): number {
  if (workerId === undefined || workerId === '') {
    return -1
  }
  return parseInt(workerId, 10)
}

export function getUniqueTestServerPort(
  vitestId: number,
  testPortStart: number,
): number {
  if (vitestId < 0) {
    // Irrelevant, running in browser.
    return 0
  }
  return testPortStart + vitestId
}

export function getBackendUrl(
  vitestId: number,
  uniqueTestServerPort: number,
): string {
  if (vitestId > -1) {
    return `http://localhost:${uniqueTestServerPort}`
  }

  // v8 ignore start -- In browser URL is set but default is good in dev.
  const envUrl =
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
     * env variables seem to be considered any.
     */
    import.meta.env.VITE_BACKEND_URL as unknown as string | undefined
  return envUrl ?? 'http://localhost:3001'
  // v8 ignore stop
}
