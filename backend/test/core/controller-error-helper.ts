import { expect } from 'earl'
import { ControllerError } from '../../src/core/errors'

// Note that these helpers cannot thoroughly check the error as long as earl
// error functions are used. However, as long as errors are constants it does
// not really matter. In case of ad hoc construction it would be important to
// check everything in errors.

export async function expectReject(fn: () => Promise<void>, error: ControllerError) {
  expect(async () => {
    await fn()
  }).toBeRejectedWith(ControllerError, error.message)
}

export function expectThrow(fn: () => void, error: ControllerError) {
  expect(() => {
    fn()
  }).toThrow(ControllerError, error.message)
}
