import { expect } from 'earl'
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
   expect(receivedError).toBeA(ControllerError)
   const error: ControllerError = receivedError as ControllerError
   expect(error.message).toEqual(expectedError.message)
   expect(error.status).toEqual(expectedError.status)
}
