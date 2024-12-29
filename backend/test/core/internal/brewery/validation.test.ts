import { expect } from 'earl'

import {
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest,
} from '../../../../src/core/internal/brewery/validation'
import {
  invalidBreweryError,
  invalidBreweryIdError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'

function validRequest (): Record<string, unknown> {
  return {
    name: 'Craft Brewery'
  }
}

describe('brewery validation unit tests', () => {
  it('valid create brewery request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    expect(validateCreateBreweryRequest(input)).toLooseEqual(output)
  })

  it('valid update brewery request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    const id = '3e2d9787-4787-4435-8e1e-475e0bb7c525'
    expect(validateUpdateBreweryRequest(input, id)).toLooseEqual({
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateBreweryRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = '87cab4b2-8932-4d8d-a78f-4d63702e4251'
        return validateUpdateBreweryRequest(request, id)
      },
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    function fail (brewery: unknown) {
      expectThrow(() => func(brewery), invalidBreweryError)
    }

    it(title('fail with empty name'), () => {
      const brewery = {
        ...validRequest(),
        name: ''
      }
      fail(brewery)
    })

    it(title('fail without name'), () => {
      fail({})
    })

    it(title('fail with invalid name'), () => {
      const brewery = {
        ...validRequest(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(brewery)
    })

    it(title('fail with additional property'), () => {
      const brewery = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(brewery)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateBreweryRequest(validRequest(), '')
    , invalidBreweryIdError)
  })
})
