import { expect } from 'chai'

import {
  validateCreateStorageRequest,
  validateUpdateStorageRequest,
} from '../../../src/core/storage/storage'
import {
  invalidStorageError,
  invalidStorageIdError
} from '../../../src/core/errors'

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
      func: (request: unknown) => {
        const id = 'f824f850-e7b7-4972-a3ac-2e2fc447c8aa'
        return validateUpdateStorageRequest(request, id)
      },
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, title } = validator

    it(title('pass validation'), () => {
      const input = validRequest()
      const output = validRequest()
      expect(func(input)).to.eql(output)
    })

    function fail (storage: unknown) {
      expect(() => func(storage)).to.throw(invalidStorageError)
    }

    it(title('fail with empty beer'), () => {
      const storage = {
        ...validRequest(),
        beer: ''
      }
      fail(storage)
    })

    it(title('fail with invalid beer'), () => {
      const storage = {
        ...validRequest(),
        beer: {}
      }
      fail(storage)
    })

    it(title('fail without beer'), () => {
      const { bestBefore, container } = validRequest()
      fail({ bestBefore, container })
    })

    it(title('fail with empty best before'), () => {
      const storage = {
        ...validRequest(),
        bestBefore: ''
      }
      fail(storage)
    })

    it(title('fail with invalid best before'), () => {
      const storage = {
        ...validRequest(),
        bestBefore: 123
      }
      fail(storage)
    })

    it(title('fail without best before'), () => {
      const { beer, container } = validRequest()
      fail({ beer, container })
    })

    it(title('fail with empty container'), () => {
      const storage = {
        ...validRequest(),
        container: ''
      }
      fail(storage)
    })

    it(title('fail with invalid container'), () => {
      const storage = {
        ...validRequest(),
        container: [ null ]
      }
      fail(storage)
    })

    it(title('fail without container'), () => {
      const { beer, bestBefore } = validRequest()
      fail({ beer, bestBefore })
    })

    it(title('fail with additional property'), () => {
      const storage = {
        ...validRequest(),
        additional: 'will fail'
      }
      fail(storage)
    })
  })

  it('fail update with empty id', () => {
    expect(
      () => validateUpdateStorageRequest(validRequest(), '')
    ).to.throw(invalidStorageIdError)
  })
})
