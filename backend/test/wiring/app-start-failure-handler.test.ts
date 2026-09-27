import { suite, test } from '../test.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import { mockFunction } from '../mock.js'
import type { Level } from '../../src/console/log.js'
import type { Process } from '../../src/wiring/app-start-failure-handler.js'
import { createStartFailureHandler } from '../../src/wiring/app-start-failure-handler.js'

suite('app start failure handler', () => {
  test('logs the error it was given', () => {
    const log = mockFunction<[level: Level, ...args: unknown[]]>()
    const process: Process = { exitCode: undefined }
    const error = new Error('connect ECONNREFUSED 127.0.0.1:5432')
    createStartFailureHandler(log, process)(error)
    assertEqual(log.mock.callCount(), 1)
    assertDeepEqual(log.mock.calls[0].arguments, [
      'ERROR',
      'App failed to start',
      error,
    ])
  })

  test('sets a failing exit code', () => {
    const log = mockFunction<[level: Level, ...args: unknown[]]>()
    const process: Process = { exitCode: undefined }
    createStartFailureHandler(log, process)(new Error('failed'))
    assertEqual(process.exitCode, 1)
  })
})
