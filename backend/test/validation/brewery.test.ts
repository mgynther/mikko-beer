import { describe, it } from 'node:test'

import {
  validateBreweryId,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest,
} from '../../src/validation/brewery.js'
import type { CreateBreweryRequest } from '../../src/validation/brewery.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validRequest(): CreateBreweryRequest {
  return {
    name: 'Craft Brewery',
  }
}

describe('brewery validation unit tests', () => {
  it('valid create brewery request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    assertEqual(validateCreateBreweryRequest(input).errorCode, undefined)
    assertDeepEqual(validateCreateBreweryRequest(input).result, output)
  })

  it('invalid create brewery request fails validation', () => {
    const input = {}
    assertEqual(
      validateCreateBreweryRequest(input).errorCode,
      'invalid-brewery',
    )
    assertDeepEqual(validateCreateBreweryRequest(input).result, undefined)
  })

  it('valid update brewery request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    const id = '3e2d9787-4787-4435-8e1e-475e0bb7c525'
    const validationResult = validateUpdateBreweryRequest(input, id)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      id,
      request: output,
    })
  })
  ;[
    {
      func: validateCreateBreweryRequest,
      title: (base: string) => `${base}: create`,
    },
    {
      func: (request: unknown) => {
        const id = '87cab4b2-8932-4d8d-a78f-4d63702e4251'
        return validateUpdateBreweryRequest(request, id)
      },
      title: (base: string) => `${base}: update`,
    },
  ].forEach((validator) => {
    const { func, title } = validator

    function fail(brewery: unknown) {
      const result = func(brewery)
      assertEqual(result.errorCode, 'invalid-brewery')
      assertEqual(result.result, undefined)
    }

    it(title('fail with empty name'), () => {
      const brewery = {
        ...validRequest(),
        name: '',
      }
      fail(brewery)
    })

    it(title('fail without name'), () => {
      fail({})
    })

    it(title('fail with invalid name'), () => {
      const brewery = {
        ...validRequest(),
        name: ['f', 'a', 'i', 'l'],
      }
      fail(brewery)
    })

    it(title('fail with additional property'), () => {
      const brewery = {
        ...validRequest(),
        additional: 'will fail',
      }
      fail(brewery)
    })
  })

  it('fail update with empty id', () => {
    const validationResult = validateUpdateBreweryRequest(validRequest(), '')
    assertEqual(validationResult.errorCode, 'invalid-brewery-id')
    assertEqual(validationResult.result, undefined)
  })

  it('valid brewery id passes validation', () => {
    const id = '5b0cc2fa-3f0b-4f19-8b8c-0a4f0a2b7d2e'
    const validationResult = validateBreweryId(id)
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
    it(`invalid brewery id "${testCase.label}" fails validation`, () => {
      const validationResult = validateBreweryId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-brewery-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})
