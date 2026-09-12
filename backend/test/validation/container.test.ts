import { describe, it } from 'node:test'

import {
  validateContainerId,
  validateCreateContainerRequest,
  validateUpdateContainerRequest,
} from '../../src/validation/container.js'
import type {
  CreateContainerRequest,
  UpdateContainerRequest,
} from '../../src/validation/container.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validCreateRequest(): CreateContainerRequest {
  return {
    type: 'bottle',
    size: '0.33',
  }
}

function validUpdateRequest(): UpdateContainerRequest {
  return {
    type: 'bottle',
    size: '0.33',
  }
}

describe('container validation unit tests', () => {
  it('valid create container request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertEqual(validateCreateContainerRequest(input).errorCode, undefined)
    assertDeepEqual(validateCreateContainerRequest(input).result, output)
  })

  it('invalid create container request fails validation', () => {
    const input = { type: 'bottle' }
    assertEqual(
      validateCreateContainerRequest(input).errorCode,
      'invalid-container',
    )
    assertDeepEqual(validateCreateContainerRequest(input).result, undefined)
  })

  it('valid update container request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const id = '259b2593-7ec5-47c5-b379-cd29083fa726'
    const validationResult = validateUpdateContainerRequest(input, id)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      id,
      request: output,
    })
  })
  ;[
    {
      func: validateCreateContainerRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`,
    },
    {
      func: (request: unknown) => {
        const id = '04a90b9c-b96a-4013-8d84-1680fff0abe1'
        return validateUpdateContainerRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`,
    },
  ].forEach((validator) => {
    const { func, getValid, title } = validator

    function fail(container: unknown) {
      const result = func(container)
      assertEqual(result.errorCode, 'invalid-container')
      assertEqual(result.result, undefined)
    }

    it(title('fail with empty type'), () => {
      const container = {
        ...getValid(),
        type: '',
      }
      fail(container)
    })

    it(title('fail with empty size'), () => {
      const container = {
        ...getValid(),
        size: '',
      }
      fail(container)
    })

    it(title('fail without type'), () => {
      const { size } = getValid()
      fail({ size })
    })

    it(title('fail without size'), () => {
      const { type } = getValid()
      fail({ type })
    })

    it(title('fail with invalid type'), () => {
      const container = {
        ...getValid(),
        type: 123,
      }
      fail(container)
    })

    it(title('fail with invalid size'), () => {
      const container = {
        ...getValid(),
        size: {},
      }
      fail(container)
    })

    it(title('fail with vague size'), () => {
      const container = {
        ...getValid(),
        size: '1.0',
      }
      fail(container)
    })

    it(title('fail with specific size'), () => {
      const container = {
        ...getValid(),
        size: '1.001',
      }
      fail(container)
    })

    it(title('fail with additional property'), () => {
      const container = {
        ...getValid(),
        additional: 'will fail',
      }
      fail(container)
    })
  })

  it('fail update with empty id', () => {
    const validationResult = validateUpdateContainerRequest(
      validUpdateRequest(),
      '',
    )
    assertEqual(validationResult.errorCode, 'invalid-container-id')
    assertEqual(validationResult.result, undefined)
  })

  it('valid container id passes validation', () => {
    const id = 'dc3baca5-6c3d-44e1-b6a4-f2be0b2e02ab'
    const validationResult = validateContainerId(id)
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
    it(`invalid container id "${testCase.label}" fails validation`, () => {
      const validationResult = validateContainerId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-container-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})
