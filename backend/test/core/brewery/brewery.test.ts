import { expect } from 'chai'

import {
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest,
} from '../../../src/core/brewery/brewery'
import { invalidBreweryError, invalidBreweryIdError } from '../../../src/core/errors'

function validRequest (): Record<string, unknown> {
  return {
    name: 'Craft Brewery'
  }
}

describe('brewery unit tests', () => {
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

    it(title('pass validation'), () => {
      const input = validRequest()
      const output = validRequest()
      expect(func(input)).to.eql(output)
    })

    function fail (brewery: unknown) {
      expect(() => func(brewery)).to.throw(invalidBreweryError)
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
    expect(
      () => validateUpdateBreweryRequest(validRequest(), '')
    ).to.throw(invalidBreweryIdError)
  })
})
