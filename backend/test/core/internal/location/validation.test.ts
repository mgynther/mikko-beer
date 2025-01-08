import { expect } from 'earl'

import {
  validateCreateLocationRequest,
  validateUpdateLocationRequest,
} from '../../../../src/core/internal/location/validation'
import {
  invalidLocationError,
  invalidLocationIdError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'

function validRequest (): Record<string, unknown> {
  return {
    name: 'Shady Location'
  }
}

describe('location validation unit tests', () => {
  it('valid create location request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    expect(validateCreateLocationRequest(input)).toLooseEqual(output)
  })

  it('valid update location request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    const id = '1cd2c9e0-908f-4769-a484-a4f18b20f467'
    expect(validateUpdateLocationRequest(input, id)).toLooseEqual({
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateLocationRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = '68f64c7d-e0bd-4db5-b7c5-e183da9e12e0'
        return validateUpdateLocationRequest(request, id)
      },
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    function fail (location: unknown) {
      expectThrow(() => func(location), invalidLocationError)
    }

    it(title('fail with empty name'), () => {
      const location = {
        ...validRequest(),
        name: ''
      }
      fail(location)
    })

    it(title('fail without name'), () => {
      fail({})
    })

    it(title('fail with invalid name'), () => {
      const location = {
        ...validRequest(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(location)
    })

    it(title('fail with additional property'), () => {
      const location = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(location)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateLocationRequest(validRequest(), '')
    , invalidLocationIdError)
  })
})
