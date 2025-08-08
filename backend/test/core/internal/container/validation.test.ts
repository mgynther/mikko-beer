import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import {
  validateCreateContainerRequest,
  validateUpdateContainerRequest,
} from '../../../../src/core/internal/container/validation'
import {
  invalidContainerError,
  invalidContainerIdError
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'

function validRequest (): Record<string, unknown> {
  return {
    type: 'bottle',
    size: '0.33'
  }
}

describe('container validation unit tests', () => {
  it('valid create container request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    assert.deepEqual(validateCreateContainerRequest(input), output)
  })

  it('valid update container request passes validation', () => {
    const input = validRequest()
    const output = validRequest()
    const id = '259b2593-7ec5-47c5-b379-cd29083fa726'
    assert.deepEqual(validateUpdateContainerRequest(input, id), {
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateContainerRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = '04a90b9c-b96a-4013-8d84-1680fff0abe1'
        return validateUpdateContainerRequest(request, id)
      },
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator


    function fail (container: unknown) {
      expectThrow(() => func(container), invalidContainerError)
    }

    it(title('fail with empty type'), () => {
      const container = {
        ...validRequest(),
        type: ''
      }
      fail(container)
    })

    it(title('fail with empty size'), () => {
      const container = {
        ...validRequest(),
        size: ''
      }
      fail(container)
    })

    it(title('fail without type'), () => {
      const { size } = validRequest()
      fail({ size })
    })

    it(title('fail without size'), () => {
      const { type } = validRequest()
      fail({ type })
    })

    it(title('fail with invalid type'), () => {
      const container = {
        ...validRequest(),
        type: 123
      }
      fail(container)
    })

    it(title('fail with invalid size'), () => {
      const container = {
        ...validRequest(),
        size: {}
      }
      fail(container)
    })

    it(title('fail with vague size'), () => {
      const container = {
        ...validRequest(),
        size: '1.0'
      }
      fail(container)
    })

    it(title('fail with specific size'), () => {
      const container = {
        ...validRequest(),
        size: '1.001'
      }
      fail(container)
    })

    it(title('fail with additional property'), () => {
      const container = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(container)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateContainerRequest(validRequest(), '')
    , invalidContainerIdError)
  })
})
