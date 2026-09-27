import { suite, test } from '../test.js'

import {
  validateCreateStyleRequest,
  validateStyleId,
  validateUpdateStyleRequest,
} from '../../src/validation/style.js'
import type {
  CreateStyleRequest,
  UpdateStyleRequest,
  ValidUpdateStyleRequest,
} from '../../src/validation/style.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validCreateRequest(): CreateStyleRequest {
  return {
    name: 'Cream Ale',
    parents: [
      '2f456063-7811-4a4d-bcaa-60ca58cae00f',
      '13dd3e1a-15b9-4895-a13d-fd36b9689a14',
    ],
  }
}

function validUpdateRequest(): UpdateStyleRequest {
  return {
    name: 'Wheat IPA',
    parents: [
      '64a31dbb-b6e6-4227-aa9d-48ce5a82c4b1',
      'c4caf207-98f0-4a3b-8297-b898d2a22bb7',
    ],
  }
}

suite('style validation unit tests', () => {
  const id = 'c8e02862-7fe7-44d5-b0eb-cd23e72faf56'

  test('valid create style request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertEqual(validateCreateStyleRequest(input).errorCode, undefined)
    assertDeepEqual(validateCreateStyleRequest(input).result, output)
  })

  test('invalid create style request fails validation', () => {
    const input = { name: 'Cream Ale' }
    assertEqual(validateCreateStyleRequest(input).errorCode, 'invalid-style')
    assertDeepEqual(validateCreateStyleRequest(input).result, undefined)
  })

  test('valid update style request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const validationResult = validateUpdateStyleRequest(input, id)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      id,
      request: output,
    })
  })
  ;[
    {
      func: validateCreateStyleRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`,
      outFormatter: (input: CreateStyleRequest): CreateStyleRequest => input,
    },
    {
      func: (request: unknown) => validateUpdateStyleRequest(request, id),
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`,
      outFormatter: (input: UpdateStyleRequest): ValidUpdateStyleRequest => ({
        id,
        request: input,
      }),
    },
  ].forEach((validator) => {
    const { func, getValid, outFormatter, title } = validator

    test(title('pass validation without parents'), () => {
      const input = { name: getValid().name, parents: [] }
      const output = { ...input }
      const validationResult = func(input)
      assertEqual(validationResult.errorCode, undefined)
      assertDeepEqual(validationResult.result, outFormatter(output))
    })

    function fail(style: unknown) {
      const result = func(style)
      assertEqual(result.errorCode, 'invalid-style')
      assertEqual(result.result, undefined)
    }

    test(title('fail with empty name'), () => {
      const style = {
        ...getValid(),
        name: '',
      }
      fail(style)
    })

    test(title('fail without name'), () => {
      const { parents } = getValid()
      fail({ parents })
    })

    test(title('fail with invalid name'), () => {
      const style = {
        ...getValid(),
        name: 123,
      }
      fail(style)
    })

    test(title('fail without parents property'), () => {
      const { name } = getValid()
      fail({ name })
    })

    test(title('fail with invalid parents'), () => {
      const style = {
        ...getValid(),
        parents: [123],
      }
      fail(style)
    })

    test(title('fail with empty parent'), () => {
      const style = {
        ...getValid(),
        parents: [''],
      }
      fail(style)
    })

    test(title('fail with additional property'), () => {
      const style = {
        ...getValid(),
        additional: 'will fail',
      }
      fail(style)
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
    test(`fail update with ${testCase.label} style id`, () => {
      const validationResult = validateUpdateStyleRequest(
        validUpdateRequest(),
        testCase.id,
      )
      assertEqual(validationResult.errorCode, 'invalid-style-id')
      assertEqual(validationResult.result, undefined)
    }),
  )

  test('valid style id passes validation', () => {
    const validationResult = validateStyleId(id)
    assertEqual(validationResult.errorCode, undefined)
    assertEqual(validationResult.result, id)
  })

  invalidIdCases.forEach((testCase) =>
    test(`invalid style id "${testCase.label}" fails validation`, () => {
      const validationResult = validateStyleId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-style-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})
