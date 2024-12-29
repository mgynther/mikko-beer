import { expect } from 'earl'

import {
  validateCreateBeerRequest,
  validateUpdateBeerRequest,
} from '../../../../src/core/internal/beer/validation'
import {
  invalidBeerError,
  invalidBeerIdError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'

function validRequest (): Record<string, unknown> {
  return {
    name: 'Craft lager',
    breweries: [
      'b672f77e-4e70-40a8-9218-bbecce0ad9ff',
      '040d3ce2-4cc4-46e5-9a4e-8315d552599a'
    ],
    styles: ['93d01fef-3097-49c9-8594-caba487b79f1']
  }
}

describe('beer validation unit tests', () => {
  it('valid create beer passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    expect(validateCreateBeerRequest(input)).toLooseEqual(output)
  })

  it('valid update beer passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    const id = '4924c26e-5d7b-44a4-92e1-97454fb2e5e1'
    expect(validateUpdateBeerRequest(input, id)).toLooseEqual({
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateBeerRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = 'baa97b9c-cb55-48f8-9aa9-e04248b9a695'
        return validateUpdateBeerRequest(request, id)
      },
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    function fail (beer: unknown) {
      expectThrow(() => func(beer), invalidBeerError)
    }

    it(title('fail with empty name'), () => {
      const beer = {
        ...validRequest(),
        name: ''
      }
      fail(beer)
    })

    it(title('fail without name'), () => {
      const { breweries, styles } = validRequest()
      fail({ breweries, styles })
    })

    it(title('fail without breweries'), () => {
      const { name, styles } = validRequest()
      fail({ name, styles })
    })

    it(title('fail without styles'), () => {
      const { name, breweries } = validRequest()
      fail({ name, breweries })
    })

    it(title('fail with 0 breweries'), () => {
      const beer = {
        ...validRequest(),
        breweries: []
      }
      fail(beer)
    })

    it(title('fail with 0 styles'), () => {
      const beer = {
        ...validRequest(),
        styles: []
      }
      fail(beer)
    })

    it(title('fail with invalid breweries'), () => {
      const beer = {
        ...validRequest(),
        breweries: [9]
      }
      fail(beer)
    })

    it(title('fail with invalid styles'), () => {
      const beer = {
        ...validRequest(),
        styles: [ { testing: 'will fail' } ]
      }
      fail(beer)
    })

    it(title('fail with invalid name'), () => {
      const beer = {
        ...validRequest(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(beer)
    })

    it(title('fail with additional property'), () => {
      const beer = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(beer)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateBeerRequest(validRequest(), '')
    , invalidBeerIdError)
  })
})
