import { expect } from 'chai'

import {
  validateCreateStorageRequest,
  validateUpdateStorageRequest,
} from '../../../src/core/storage/storage'

function validRequest (): Record<string, unknown> {
  return {
    beer: 'b939ba08-6afb-41ce-8419-9a1bb31ab7b7',
    bestBefore: '2023-12-08T22:55:50.111+02:00',
    container: '3769c509-d6e5-4906-99cd-fcf1e80bbc10'
  }
}

describe('storage unit tests', () => {
  [
    {
      func: validateCreateStorageRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: validateUpdateStorageRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    it(title('should pass validation'), () => {
      expect(func(validRequest())).to.equal(true)
    })

    function fail (storage: unknown) {
      expect(func(storage)).to.equal(false)
    }

    it(title('should fail with empty beer'), () => {
      const storage = {
        ...validRequest(),
        beer: ''
      }
      fail(storage)
    })

    it(title('should fail with invalid beer'), () => {
      const storage = {
        ...validRequest(),
        beer: {}
      }
      fail(storage)
    })

    it(title('should fail without beer'), () => {
      const { bestBefore, container } = validRequest()
      fail({ bestBefore, container })
    })

    it(title('should fail with empty best before'), () => {
      const storage = {
        ...validRequest(),
        bestBefore: ''
      }
      fail(storage)
    })

    it(title('should fail with invalid best before'), () => {
      const storage = {
        ...validRequest(),
        bestBefore: 123
      }
      fail(storage)
    })

    it(title('should fail without best before'), () => {
      const { beer, container } = validRequest()
      fail({ beer, container })
    })

    it(title('should fail with empty container'), () => {
      const storage = {
        ...validRequest(),
        container: ''
      }
      fail(storage)
    })

    it(title('should fail with invalid container'), () => {
      const storage = {
        ...validRequest(),
        container: [ null ]
      }
      fail(storage)
    })

    it(title('should fail without container'), () => {
      const { beer, bestBefore } = validRequest()
      fail({ beer, bestBefore })
    })

    it(title('should fail with additional property'), () => {
      const storage = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(storage)
    })
  })
})
