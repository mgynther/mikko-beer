import { suite, test } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'
import type { Level } from '../../src/data/migrate-to-latest.js'
import type { Process } from '../../src/data/migration-failure-handler.js'
import { createMigrationFailureHandler } from '../../src/data/migration-failure-handler.js'

suite('migration failure handler', () => {
  test('logs the error it was given', () => {
    const log = mockFunction<[level: Level, ...args: unknown[]]>()
    const process: Process = { exitCode: undefined }
    const error = new Error('relation "beer" already exists')
    createMigrationFailureHandler(log, process)(error)
    assertEqual(log.mock.callCount(), 1)
    assertDeepEqual(log.mock.calls[0].arguments, [
      'ERROR',
      'migration failed',
      error,
    ])
  })

  test('sets a failing exit code', () => {
    const log = mockFunction<[level: Level, ...args: unknown[]]>()
    const process: Process = { exitCode: undefined }
    createMigrationFailureHandler(log, process)(new Error('failed'))
    assertEqual(process.exitCode, 1)
  })
})
