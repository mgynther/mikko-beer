import { describe, it } from 'node:test'

import {
  validateCreateContainerRequest,
  validateUpdateContainerRequest,
} from '../../../../src/core/internal/container/validation'
import {
  invalidContainerError,
  invalidContainerIdError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'
import { assertDeepEqual } from '../../../assert'
import type {
  CreateContainerRequest,
  UpdateContainerRequest
} from '../../../../src/core/container/container'

function validCreateRequest (): CreateContainerRequest {
  return {
    type: 'bottle',
    size: '0.33'
  }
}

function validUpdateRequest (): UpdateContainerRequest {
  return {
    type: 'bottle',
    size: '0.33'
  }
}

describe('container validation unit tests', () => {
  it('valid create container request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertDeepEqual(validateCreateContainerRequest(input), output)
  })

  it('valid update container request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const id = '259b2593-7ec5-47c5-b379-cd29083fa726'
    assertDeepEqual(validateUpdateContainerRequest(input, id), {
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateContainerRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = '04a90b9c-b96a-4013-8d84-1680fff0abe1'
        return validateUpdateContainerRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, getValid, title } = validator


    function fail (container: unknown) {
      expectThrow(() => func(container), invalidContainerError)
    }

    it(title('fail with empty type'), () => {
      const container = {
        ...getValid(),
        type: ''
      }
      fail(container)
    })

    it(title('fail with empty size'), () => {
      const container = {
        ...getValid(),
        size: ''
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
        type: 123
      }
      fail(container)
    })

    it(title('fail with invalid size'), () => {
      const container = {
        ...getValid(),
        size: {}
      }
      fail(container)
    })

    it(title('fail with vague size'), () => {
      const container = {
        ...getValid(),
        size: '1.0'
      }
      fail(container)
    })

    it(title('fail with specific size'), () => {
      const container = {
        ...getValid(),
        size: '1.001'
      }
      fail(container)
    })

    it(title('fail with additional property'), () => {
      const container = {
        ...getValid(),
        additional: 'will fail'
      }
      fail(container)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateContainerRequest(validUpdateRequest(), '')
    , invalidContainerIdError)
  })
})
