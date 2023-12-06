import { expect } from 'chai'

import {
  validateCreateContainerRequest,
  validateUpdateContainerRequest,
} from '../../../src/core/container/container'

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
      func: validateUpdateContainerRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    it(title('should pass validation'), () => {
      expect(func(validRequest())).to.equal(true)
    })

    function fail (container: unknown) {
      expect(func(container)).to.equal(false)
    }

    it(title('should fail with empty type'), () => {
      const container = {
        ...validRequest(),
        type: ''
      }
      fail(container)
    })

    it(title('should fail with empty size'), () => {
      const container = {
        ...validRequest(),
        size: ''
      }
      fail(container)
    })

    it(title('should fail without type'), () => {
      const { size } = validRequest()
      fail({ size })
    })

    it(title('should fail without size'), () => {
      const { type } = validRequest()
      fail({ type })
    })

    it(title('should fail with invalid type'), () => {
      const container = {
        ...validRequest(),
        type: 123
      }
      fail(container)
    })

    it(title('should fail with invalid size'), () => {
      const container = {
        ...validRequest(),
        size: {}
      }
      fail(container)
    })

    it(title('should fail with vague size'), () => {
      const container = {
        ...validRequest(),
        size: '1.0'
      }
      fail(container)
    })

    it(title('should fail with specific size'), () => {
      const container = {
        ...validRequest(),
        size: '1.001'
      }
      fail(container)
    })

    it(title('should fail with additional property'), () => {
      const container = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(container)
    })
  })
})
