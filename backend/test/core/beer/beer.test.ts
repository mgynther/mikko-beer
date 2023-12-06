import { expect } from 'chai'

import {
  validateCreateBeerRequest,
  validateUpdateBeerRequest,
} from '../../../src/core/beer/beer'

function validRequest (): Record<string, unknown> {
  return {
    name: 'Craft lager',
    breweries: ['b672f77e-4e70-40a8-9218-bbecce0ad9ff', '040d3ce2-4cc4-46e5-9a4e-8315d552599a'],
    styles: ['93d01fef-3097-49c9-8594-caba487b79f1']
  }
}

describe('beer unit tests', () => {
  [
    {
      func: validateCreateBeerRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: validateUpdateBeerRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    it(title('should pass validation'), () => {
      expect(func(validRequest())).to.equal(true)
    })

    function fail (beer: unknown) {
      expect(func(beer)).to.equal(false)
    }

    it(title('should fail with empty name'), () => {
      const beer = {
        ...validRequest(),
        name: ''
      }
      fail(beer)
    })

    it(title('should fail without name'), () => {
      const { breweries, styles } = validRequest()
      fail({ breweries, styles })
    })

    it(title('should fail without breweries'), () => {
      const { name, styles } = validRequest()
      fail({ name, styles })
    })

    it(title('should fail without styles'), () => {
      const { name, breweries } = validRequest()
      fail({ name, breweries })
    })

    it(title('should fail with 0 breweries'), () => {
      const beer = {
        ...validRequest(),
        breweries: []
      }
      fail(beer)
    })

    it(title('should fail with 0 styles'), () => {
      const beer = {
        ...validRequest(),
        styles: []
      }
      fail(beer)
    })

    it(title('should fail with invalid breweries'), () => {
      const beer = {
        ...validRequest(),
        breweries: [9]
      }
      fail(beer)
    })

    it(title('should fail with invalid styles'), () => {
      const beer = {
        ...validRequest(),
        styles: [ { testing: 'will fail' } ]
      }
      fail(beer)
    })

    it(title('should fail with invalid name'), () => {
      const beer = {
        ...validRequest(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(beer)
    })

    it(title('should fail with additional property'), () => {
      const beer = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(beer)
    })
  })
})
