import type { log } from '../console/log.js'

// What of node's process the handler sets, so that a test can pass a plain
// object in its place.
export interface Process {
  exitCode: number | string | null | undefined
}

export function createStartFailureHandler(
  log: log,
  process: Process,
): (error: unknown) => void {
  return (error: unknown): void => {
    log('ERROR', 'App failed to start', error)
    process.exitCode = 1
  }
}
