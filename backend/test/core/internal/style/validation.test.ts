import { describe, it } from 'node:test'

import {
  validateCreateStyleRequest,
  validateUpdateStyleRequest
} from '../../../../src/core/internal/style/validation'
import {
  invalidStyleError,
  invalidStyleIdError,
} from '../../../../src/core/errors'
import { expectThrow } from '../../controller-error-helper'
import type {
  CreateStyleRequest,
  UpdateStyleRequest
} from '../../../../src/core/style/style'
import { assertDeepEqual } from '../../../assert'

describe('style unit tests', () => {
  const id = 'c8e02862-7fe7-44d5-b0eb-cd23e72faf56'

  function validCreateRequest (): CreateStyleRequest {
    return {
      name: 'Cream Ale',
      parents: [
        '2f456063-7811-4a4d-bcaa-60ca58cae00f',
        '13dd3e1a-15b9-4895-a13d-fd36b9689a14'
      ]
    }
  }

  function validUpdateRequest (): UpdateStyleRequest {
    return {
      name: 'Wheat IPA',
      parents: [
        '64a31dbb-b6e6-4227-aa9d-48ce5a82c4b1',
        'c4caf207-98f0-4a3b-8297-b898d2a22bb7'
      ]
    }
  }

  [
    {
      func: validateCreateStyleRequest,
      getValid: validCreateRequest,
      title: (base: string) => `${base}: create`,
      outFormatter: (input: object) => input
    },
    {
      func: (request: unknown) => {
        return validateUpdateStyleRequest(request, id)
      },
      getValid: validUpdateRequest,
      title: (base: string) => `${base}: update`,
      outFormatter: (input: object) => ({
        id,
        request: input
      })
    }
  ].forEach(validator => {
    const { func, getValid, outFormatter, title } = validator

    it(title('pass validation'), () => {
      const input = getValid()
      const output = getValid()
      assertDeepEqual(func(input), outFormatter(output))
    })

    it(title('pass validation without parents'), () => {
      const input = { name: getValid().name, parents: [] }
      const output = { ...input }
      assertDeepEqual(func(input), outFormatter(output))
    })

    function fail (style: unknown) {
      expectThrow(() => func(style), invalidStyleError)
    }

    it(title('fail with empty name'), () => {
      const style = {
        ...getValid(),
        name: ''
      }
      fail(style)
    })

    it(title('fail without name'), () => {
      const { parents } = getValid()
      fail({ parents })
    })

    it(title('fail with invalid name'), () => {
      const style = {
        ...getValid(),
        name: 123
      }
      fail(style)
    })

    it(title('fail without parents property'), () => {
      const { name } = getValid()
      fail({ name })
    })

    it(title('fail with invalid parents'), () => {
      const style = {
        ...getValid(),
        parents: [ 123 ]
      }
      fail(style)
    })
  })

  it('fail update with undefined style id', () => {
    expectThrow(
      () => validateUpdateStyleRequest(validUpdateRequest(), undefined),
      invalidStyleIdError
    )
  })

  it('fail update with empty style id', () => {
    expectThrow(
      () => validateUpdateStyleRequest(validUpdateRequest(), ''),
      invalidStyleIdError
    )
  })
})
