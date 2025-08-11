import { describe, it } from 'node:test'

import {
  validateCreateBeerRequest,
  validateUpdateBeerRequest,
} from '../../../../src/core/internal/beer/validation'
import {
  invalidBeerError,
  invalidBeerIdError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'
import type {
  CreateBeerRequest,
  UpdateBeerRequest
} from '../../../../src/core/beer/beer'

function validCreateRequest (): CreateBeerRequest {
  return {
    name: 'Craft lager',
    breweries: [
      'b672f77e-4e70-40a8-9218-bbecce0ad9ff',
      '040d3ce2-4cc4-46e5-9a4e-8315d552599a'
    ],
    styles: ['93d01fef-3097-49c9-8594-caba487b79f1']
  }
}

function validUpdateRequest (): UpdateBeerRequest {
  return {
    name: 'Craft session pale ale',
    breweries: [
      '1c079278-4bdd-4b0c-bb16-291f8c304424',
      '39c59017-020c-4083-a84d-e1563ca7522f'
    ],
    styles: ['623cbc9a-8953-4772-af90-6da8d3344bf4']
  }
}

describe('beer validation unit tests', () => {
  it('valid create beer passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertDeepEqual(validateCreateBeerRequest(input), output)
  })

  it('valid update beer passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const id = '4924c26e-5d7b-44a4-92e1-97454fb2e5e1'
    assertDeepEqual(validateUpdateBeerRequest(input, id), {
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateBeerRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = 'baa97b9c-cb55-48f8-9aa9-e04248b9a695'
        return validateUpdateBeerRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, getValid, title } = validator

    function fail (beer: unknown) {
      expectThrow(() => func(beer), invalidBeerError)
    }

    it(title('fail with empty name'), () => {
      const beer = {
        ...getValid(),
        name: ''
      }
      fail(beer)
    })

    it(title('fail without name'), () => {
      const { breweries, styles } = getValid()
      fail({ breweries, styles })
    })

    it(title('fail without breweries'), () => {
      const { name, styles } = getValid()
      fail({ name, styles })
    })

    it(title('fail without styles'), () => {
      const { name, breweries } = getValid()
      fail({ name, breweries })
    })

    it(title('fail with 0 breweries'), () => {
      const beer = {
        ...getValid(),
        breweries: []
      }
      fail(beer)
    })

    it(title('fail with 0 styles'), () => {
      const beer = {
        ...getValid(),
        styles: []
      }
      fail(beer)
    })

    it(title('fail with invalid breweries'), () => {
      const beer = {
        ...getValid(),
        breweries: [9]
      }
      fail(beer)
    })

    it(title('fail with invalid styles'), () => {
      const beer = {
        ...getValid(),
        styles: [ { testing: 'will fail' } ]
      }
      fail(beer)
    })

    it(title('fail with invalid name'), () => {
      const beer = {
        ...getValid(),
        name: [ 'f', 'a', 'i', 'l' ]
      }
      fail(beer)
    })

    it(title('fail with additional property'), () => {
      const beer = {
        ...getValid(),
        additional: 'will fail'
      }
      fail(beer)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateBeerRequest(validUpdateRequest(), '')
    , invalidBeerIdError)
  })
})
