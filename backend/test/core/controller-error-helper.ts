import * as assert from 'node:assert/strict'

import { ControllerError } from '../../src/core/errors'

export async function expectReject(
  fn: () => Promise<void>,
  error: ControllerError
) {
 try {
   await fn()
 } catch (e: unknown) {
   assertControllerError(e, error)
   return
 }
 throw new Error('expected rejection but promise was not rejected')
}

export function expectThrow(fn: () => void, error: ControllerError) {
 try {
   fn()
 } catch (e: unknown) {
   assertControllerError(e, error)
   return
 }
 throw new Error('expected error but nothing was thrown')
}

// earl Error validator do not seem to check message at least with async
// rejections. To avoid mistakes it's better to have a custom validator.
function assertControllerError(
  receivedError: unknown,
  expectedError: ControllerError
) {
   assert.equal(
     receivedError instanceof ControllerError,
     true,
     'not a ControllerError instance')
   const error: ControllerError = receivedError as ControllerError
   assert.equal(error.message, expectedError.message)
   assert.equal(error.status, expectedError.status)
}
