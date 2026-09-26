import { ControllerError } from '../../src/logic/errors.js'
import { assertDeepEqual, assertEqual, assertInstanceOf } from '../assert.js'

export async function expectReject(
  fn: () => Promise<void>,
  error: ControllerError,
): Promise<void> {
  try {
    await fn()
  } catch (e: unknown) {
    assertControllerError(e, error)
    return
  }
  throw new Error('expected rejection but promise was not rejected')
}

export function expectThrow(fn: () => void, error: ControllerError): void {
  try {
    fn()
  } catch (e: unknown) {
    assertControllerError(e, error)
    return
  }
  throw new Error('expected error but nothing was thrown')
}

function assertControllerError(
  receivedError: unknown,
  expectedError: ControllerError,
): void {
  assertInstanceOf(receivedError, ControllerError)
  assertEqual(receivedError.message, expectedError.message)
  assertEqual(receivedError.status, expectedError.status)
  assertDeepEqual(receivedError, expectedError)
}
