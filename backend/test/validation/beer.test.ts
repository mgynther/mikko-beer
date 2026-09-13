import { describe, it } from 'node:test'

import {
  validateBeerId,
  validateCreateBeerRequest,
  validateUpdateBeerRequest,
} from '../../src/validation/beer.js'
import type {
  CreateBeerRequest,
  UpdateBeerRequest,
} from '../../src/validation/beer.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validCreateRequest(): CreateBeerRequest {
  return {
    name: 'Craft lager',
    breweries: [
      'b672f77e-4e70-40a8-9218-bbecce0ad9ff',
      '040d3ce2-4cc4-46e5-9a4e-8315d552599a',
    ],
    styles: ['93d01fef-3097-49c9-8594-caba487b79f1'],
  }
}

function validUpdateRequest(): UpdateBeerRequest {
  return {
    name: 'Craft session pale ale',
    breweries: [
      '1c079278-4bdd-4b0c-bb16-291f8c304424',
      '39c59017-020c-4083-a84d-e1563ca7522f',
    ],
    styles: ['623cbc9a-8953-4772-af90-6da8d3344bf4'],
  }
}

describe('beer validation unit tests', () => {
  const id = '4924c26e-5d7b-44a4-92e1-97454fb2e5e1'

  it('valid create beer request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertEqual(validateCreateBeerRequest(input).errorCode, undefined)
    assertDeepEqual(validateCreateBeerRequest(input).result, output)
  })

  it('invalid create beer request fails validation', () => {
    const input = { name: 'Craft lager' }
    assertEqual(validateCreateBeerRequest(input).errorCode, 'invalid-beer')
    assertDeepEqual(validateCreateBeerRequest(input).result, undefined)
  })

  it('valid update beer request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const validationResult = validateUpdateBeerRequest(input, id)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      id,
      request: output,
    })
  })
  ;[
    {
      func: validateCreateBeerRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`,
    },
    {
      func: (request: unknown) => validateUpdateBeerRequest(request, id),
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`,
    },
  ].forEach((validator) => {
    const { func, getValid, title } = validator

    function fail(beer: unknown) {
      const result = func(beer)
      assertEqual(result.errorCode, 'invalid-beer')
      assertEqual(result.result, undefined)
    }

    it(title('fail with empty name'), () => {
      const beer = {
        ...getValid(),
        name: '',
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
        breweries: [],
      }
      fail(beer)
    })

    it(title('fail with 0 styles'), () => {
      const beer = {
        ...getValid(),
        styles: [],
      }
      fail(beer)
    })

    it(title('fail with invalid breweries'), () => {
      const beer = {
        ...getValid(),
        breweries: [9],
      }
      fail(beer)
    })

    it(title('fail with invalid styles'), () => {
      const beer = {
        ...getValid(),
        styles: [{ testing: 'will fail' }],
      }
      fail(beer)
    })

    it(title('fail with invalid name'), () => {
      const beer = {
        ...getValid(),
        name: ['f', 'a', 'i', 'l'],
      }
      fail(beer)
    })

    it(title('fail with additional property'), () => {
      const beer = {
        ...getValid(),
        additional: 'will fail',
      }
      fail(beer)
    })
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
    it(`fail update with ${testCase.label} beer id`, () => {
      const validationResult = validateUpdateBeerRequest(
        validUpdateRequest(),
        testCase.id,
      )
      assertEqual(validationResult.errorCode, 'invalid-beer-id')
      assertEqual(validationResult.result, undefined)
    }),
  )

  it('valid beer id passes validation', () => {
    const validationResult = validateBeerId(id)
    assertEqual(validationResult.errorCode, undefined)
    assertEqual(validationResult.result, id)
  })

  invalidIdCases.forEach((testCase) =>
    it(`invalid beer id "${testCase.label}" fails validation`, () => {
      const validationResult = validateBeerId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-beer-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})
