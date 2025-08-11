import { ControllerError } from '../../src/core/errors'
import { assertEqual, assertInstanceOf } from '../assert'

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
   assertInstanceOf(receivedError, ControllerError)
   const error: ControllerError = receivedError as ControllerError
   assertEqual(error.message, expectedError.message)
   assertEqual(error.status, expectedError.status)
}
