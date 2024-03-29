import { expect } from 'chai'

import {
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest,
} from '../../../src/core/brewery/brewery'

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
      func: validateUpdateBreweryRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    it(title('should pass validation'), () => {
      expect(func(validRequest())).to.equal(true)
    })

    function fail (brewery: unknown) {
      expect(func(brewery)).to.equal(false)
    }

    it(title('should fail with empty name'), () => {
      const brewery = {
        ...validRequest(),
        name: ''
      }
      fail(brewery)
    })

    it(title('should fail without name'), () => {
      fail({})
    })

    it(title('should fail with invalid name'), () => {
      const brewery = {
        ...validRequest(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(brewery)
    })

    it(title('should fail with additional property'), () => {
      const brewery = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(brewery)
    })
  })
})
