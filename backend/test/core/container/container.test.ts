import { expect } from 'earl'

import {
  validateCreateContainerRequest,
  validateUpdateContainerRequest,
} from '../../../src/core/container/container'
import { invalidContainerError, invalidContainerIdError } from '../../../src/core/errors'
import { expectThrow } from '../controller-error-helper'

function validRequest (): Record<string, unknown> {
  return {
    type: 'bottle',
    size: '0.33'
  }
}

describe('container unit tests', () => {
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

    it(title('pass validation'), () => {
      const input = validRequest()
      const output = validRequest()
      expect(func(input)).toLooseEqual(output)
    })

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
