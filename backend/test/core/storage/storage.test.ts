import { describe, it } from 'node:test'

import {
  validateCreateStorageRequest,
  validateUpdateStorageRequest,
} from '../../../src/core/internal/storage/validation'
import {
  invalidStorageError,
  invalidStorageIdError
} from '../../../src/core/errors'
import { expectThrow } from '../controller-error-helper'
import { assertDeepEqual } from '../../assert'
import type {
  CreateStorageRequest,
  UpdateStorageRequest
} from '../../../src/core/storage/storage'

function validCreateRequest (): CreateStorageRequest {
  return {
    beer: 'b939ba08-6afb-41ce-8419-9a1bb31ab7b7',
    bestBefore: '2023-12-08T22:55:50.111+02:00',
    container: '3769c509-d6e5-4906-99cd-fcf1e80bbc10'
  }
}

function validUpdateRequest (): UpdateStorageRequest {
  return {
    beer: '8cdb1968-2392-4361-8bde-ce4e266a3bc7',
    bestBefore: '2023-12-08T22:55:50.111+02:00',
    container: 'd446881c-4cd3-4684-96c8-687acf7f9266'
  }
}

describe('storage validation unit tests', () => {
  it('valid create storate request passes validation', () => {
    const input = validCreateRequest()
    const output = validCreateRequest()
    assertDeepEqual(validateCreateStorageRequest(input), output)
  })

  it('valid update storate request passes validation', () => {
    const input = validUpdateRequest()
    const output = validUpdateRequest()
    const id = '328ec839-cf21-43b3-8a33-8b69c126eebc'
    assertDeepEqual(validateUpdateStorageRequest(input, id), {
      id,
      request: output
    })
  });

  [
    {
      func: validateCreateStorageRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = 'f824f850-e7b7-4972-a3ac-2e2fc447c8aa'
        return validateUpdateStorageRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`
    }
  ].forEach(validator => {
    const { func, getValid, title } = validator

    function fail (storage: unknown) {
      expectThrow(() => func(storage), invalidStorageError)
    }

    it(title('fail with empty beer'), () => {
      const storage = {
        ...getValid(),
        beer: ''
      }
      fail(storage)
    })

    it(title('fail with invalid beer'), () => {
      const storage = {
        ...getValid(),
        beer: {}
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
        bestBefore: ''
      }
      fail(storage)
    })

    it(title('fail with invalid best before'), () => {
      const storage = {
        ...getValid(),
        bestBefore: 123
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
        container: ''
      }
      fail(storage)
    })

    it(title('fail with invalid container'), () => {
      const storage = {
        ...getValid(),
        container: [ null ]
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
        additional: 'will fail'
      }
      fail(storage)
    })
  })

  it('fail update with empty id', () => {
    expectThrow(
      () => validateUpdateStorageRequest(validUpdateRequest(), '')
    , invalidStorageIdError)
  })
})
