import { describe, it } from 'node:test'

import {
  validateCreateStorageRequest,
  validateStorageId,
  validateUpdateStorageRequest,
} from '../../src/validation/storage.js'
import type {
  CreateStorageRequest,
  UpdateStorageRequest,
} from '../../src/validation/storage.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validCreateRequest(): CreateStorageRequest {
  return {
    beer: 'b939ba08-6afb-41ce-8419-9a1bb31ab7b7',
    bestBefore: '2023-12-08T22:55:50.111+02:00',
    container: '3769c509-d6e5-4906-99cd-fcf1e80bbc10',
  }
}

function validUpdateRequest(): UpdateStorageRequest {
  return {
    beer: '8cdb1968-2392-4361-8bde-ce4e266a3bc7',
    bestBefore: '2023-12-08T22:55:50.111+02:00',
    container: 'd446881c-4cd3-4684-96c8-687acf7f9266',
  }
}

describe('storage validation unit tests', () => {
  const id = '328ec839-cf21-43b3-8a33-8b69c126eebc'

  it('valid create storage request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertEqual(validateCreateStorageRequest(input).errorCode, undefined)
    assertDeepEqual(validateCreateStorageRequest(input).result, output)
  })

  it('invalid create storage request fails validation', () => {
    const input = { beer: validCreateRequest().beer }
    assertEqual(
      validateCreateStorageRequest(input).errorCode,
      'invalid-storage',
    )
    assertDeepEqual(validateCreateStorageRequest(input).result, undefined)
  })

  it('valid update storage request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const validationResult = validateUpdateStorageRequest(input, id)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      id,
      request: output,
    })
  })
  ;[
    {
      func: validateCreateStorageRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`,
    },
    {
      func: (request: unknown) => validateUpdateStorageRequest(request, id),
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`,
    },
  ].forEach((validator) => {
    const { func, getValid, title } = validator

    function fail(storage: unknown) {
      const result = func(storage)
      assertEqual(result.errorCode, 'invalid-storage')
      assertEqual(result.result, undefined)
    }

    it(title('fail with empty beer'), () => {
      const storage = {
        ...getValid(),
        beer: '',
      }
      fail(storage)
    })

    it(title('fail with invalid beer'), () => {
      const storage = {
        ...getValid(),
        beer: {},
      }
      fail(storage)
    })

    it(title('fail without beer'), () => {
      const { bestBefore, container } = getValid()
      fail({ bestBefore, container })
    })

    it(title('fail with empty best before'), () => {
      const storage = {
        ...getValid(),
        bestBefore: '',
      }
      fail(storage)
    })

    it(title('fail with invalid best before'), () => {
      const storage = {
        ...getValid(),
        bestBefore: 123,
      }
      fail(storage)
    })

    it(title('fail with malformed best before'), () => {
      const storage = {
        ...getValid(),
        bestBefore: '2023-12-08',
      }
      fail(storage)
    })

    it(title('fail without best before'), () => {
      const { beer, container } = getValid()
      fail({ beer, container })
    })

    it(title('fail with empty container'), () => {
      const storage = {
        ...getValid(),
        container: '',
      }
      fail(storage)
    })

    it(title('fail with invalid container'), () => {
      const storage = {
        ...getValid(),
        container: [null],
      }
      fail(storage)
    })

    it(title('fail without container'), () => {
      const { beer, bestBefore } = getValid()
      fail({ beer, bestBefore })
    })

    it(title('fail with additional property'), () => {
      const storage = {
        ...getValid(),
        additional: 'will fail',
      }
      fail(storage)
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
    it(`fail update with ${testCase.label} storage id`, () => {
      const validationResult = validateUpdateStorageRequest(
        validUpdateRequest(),
        testCase.id,
      )
      assertEqual(validationResult.errorCode, 'invalid-storage-id')
      assertEqual(validationResult.result, undefined)
    }),
  )

  it('valid storage id passes validation', () => {
    const validationResult = validateStorageId(id)
    assertEqual(validationResult.errorCode, undefined)
    assertEqual(validationResult.result, id)
  })

  invalidIdCases.forEach((testCase) =>
    it(`invalid storage id "${testCase.label}" fails validation`, () => {
      const validationResult = validateStorageId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-storage-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})
