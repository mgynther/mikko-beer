import { describe, it } from 'node:test'

import {
  validateCreateLocationRequest,
  validateUpdateLocationRequest,
} from '../../../../src/core/internal/location/validation'
import {
  invalidLocationError,
  invalidLocationIdError
} from '../../../../src/core/errors'
import type {
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../../../src/core/location/location'
import { expectThrow } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'

function validCreateRequest (): CreateLocationRequest {
  return {
    name: 'Shady Location'
  }
}

function validUpdateRequest (): UpdateLocationRequest {
  return {
    name: 'Shady Location'
  }
}

describe('location validation unit tests', () => {
  it('valid create location request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertDeepEqual(validateCreateLocationRequest(input), output)
  })

  it('valid update location request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const id = '1cd2c9e0-908f-4769-a484-a4f18b20f467'
    assertDeepEqual(validateUpdateLocationRequest(input, id), {
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateLocationRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = '68f64c7d-e0bd-4db5-b7c5-e183da9e12e0'
        return validateUpdateLocationRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, getValid, title } = validator

    function fail (location: unknown) {
      expectThrow(() => func(location), invalidLocationError)
    }

    it(title('fail with empty name'), () => {
      const location = {
        ...getValid(),
        name: ''
      }
      fail(location)
    })

    it(title('fail without name'), () => {
      fail({})
    })

    it(title('fail with invalid name'), () => {
      const location = {
        ...getValid(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(location)
    })

    it(title('fail with additional property'), () => {
      const location = {
        ...getValid(),
        additional: 'will fail'
      }
      fail(location)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateLocationRequest(validUpdateRequest(), '')
    , invalidLocationIdError)
  })
})
