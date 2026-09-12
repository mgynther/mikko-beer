import { describe, it } from 'node:test'

import {
  validateLocationId,
  validateCreateLocationRequest,
  validateUpdateLocationRequest,
} from '../../src/validation/location.js'
import type {
  CreateLocationRequest,
  UpdateLocationRequest,
} from '../../src/validation/location.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validCreateRequest(): CreateLocationRequest {
  return {
    name: 'Shady Location',
  }
}

function validUpdateRequest(): UpdateLocationRequest {
  return {
    name: 'Shady Location',
  }
}

describe('location validation unit tests', () => {
  it('valid create location request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertEqual(validateCreateLocationRequest(input).errorCode, undefined)
    assertDeepEqual(validateCreateLocationRequest(input).result, output)
  })

  it('invalid create location request fails validation', () => {
    const input = {}
    assertEqual(
      validateCreateLocationRequest(input).errorCode,
      'invalid-location',
    )
    assertDeepEqual(validateCreateLocationRequest(input).result, undefined)
  })

  it('valid update location request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const id = '1cd2c9e0-908f-4769-a484-a4f18b20f467'
    const validationResult = validateUpdateLocationRequest(input, id)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      id,
      request: output,
    })
  })
  ;[
    {
      func: validateCreateLocationRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`,
    },
    {
      func: (request: unknown) => {
        const id = '68f64c7d-e0bd-4db5-b7c5-e183da9e12e0'
        return validateUpdateLocationRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`,
    },
  ].forEach((validator) => {
    const { func, getValid, title } = validator

    function fail(location: unknown) {
      const result = func(location)
      assertEqual(result.errorCode, 'invalid-location')
      assertEqual(result.result, undefined)
    }

    it(title('fail with empty name'), () => {
      const location = {
        ...getValid(),
        name: '',
      }
      fail(location)
    })

    it(title('fail without name'), () => {
      fail({})
    })

    it(title('fail with invalid name'), () => {
      const location = {
        ...getValid(),
        name: ['f', 'a', 'i', 'l'],
      }
      fail(location)
    })

    it(title('fail with additional property'), () => {
      const location = {
        ...getValid(),
        additional: 'will fail',
      }
      fail(location)
    })
  })

  it('fail update with empty id', () => {
    const validationResult = validateUpdateLocationRequest(
      validUpdateRequest(),
      '',
    )
    assertEqual(validationResult.errorCode, 'invalid-location-id')
    assertEqual(validationResult.result, undefined)
  })

  it('valid location id passes validation', () => {
    const id = 'd4a6e2ba-9e1e-4b2b-9e2f-9d6a9b0e5b13'
    const validationResult = validateLocationId(id)
    assertEqual(validationResult.errorCode, undefined)
    assertEqual(validationResult.result, id)
  })

  interface InvalidIdCase {
    label: string
    id: string | undefined
  }
  const invalidIdCases: InvalidIdCase[] = [
    { label: 'empty string', id: '' },
    { label: 'undefined', id: undefined },
  ]

  invalidIdCases.forEach((testCase) =>
    it(`invalid location id "${testCase.label}" fails validation`, () => {
      const validationResult = validateLocationId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-location-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})
