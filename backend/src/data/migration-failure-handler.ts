import type { Log } from './migrate-to-latest.js'

// What of node's process the handler sets, so that a test can pass a plain
// object in its place.
export interface Process {
  exitCode: number | string | null | undefined
}

export function createMigrationFailureHandler(
  log: Log,
  process: Process,
): (error: unknown) => void {
  return (error: unknown): void => {
    log('ERROR', 'migration failed', error)
    process.exitCode = 1
  }
}
