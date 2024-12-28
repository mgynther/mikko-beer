import { expect } from 'earl'
import { v4 as uuidv4 } from 'uuid'

import {
  validateCreateStyleRequest,
  validateUpdateStyleRequest
} from '../../src/core/style'
import {
  cyclicRelationshipError,
  invalidStyleError,
  invalidStyleIdError,
} from '../../src/core/errors'
import { checkCyclicRelationships } from '../../src/core/internal/style/style.util'
import { expectThrow } from './controller-error-helper'

describe('style relationship unit tests', () => {
  const ale = {
    id: uuidv4(),
    name: 'Ale',
  }
  const ipa = {
    id: uuidv4(),
    name: 'IPA',
  }
  const neipa = {
    id: uuidv4(),
    name: 'NEIPA',
  }
  const relationships = [
    {
      child: neipa.id,
      parent: ipa.id
    },
    {
      child: ipa.id,
      parent: ale.id
    }
  ]

  it('fail to find cyclic when there is no cycle', () => {
    expect(() => checkCyclicRelationships(relationships, neipa.id, [ipa.id])).not.toThrow()
  })

  it('find cyclic when there is a cycle', () => {
    expectThrow(
      () => checkCyclicRelationships(relationships, ale.id, [neipa.id])
    , cyclicRelationshipError)
  })

  it('valid create request is valid', () => {
    expect(validateCreateStyleRequest({
      name: 'name',
      parents: []
    })).toEqual({name: 'name', parents: []})
  })
})

describe('style unit tests', () => {
  const id = 'c8e02862-7fe7-44d5-b0eb-cd23e72faf56'

  function validRequest (): Record<string, unknown> {
    return {
      name: 'Cream Ale',
      parents: [
        '2f456063-7811-4a4d-bcaa-60ca58cae00f',
        '13dd3e1a-15b9-4895-a13d-fd36b9689a14'
      ]
    }
  }

  [
    {
      func: validateCreateStyleRequest,
      title: (base: string) => `${base}: create`,
      outFormatter: (input: object) => input
    },
    {
      func: (request: unknown) => {
        return validateUpdateStyleRequest(request, id)
      },
      title: (base: string) => `${base}: update`,
      outFormatter: (input: object) => ({
        id,
        request: input
      })
    }
  ].forEach(validator => {
    const { func, outFormatter, title } = validator

    it(title('pass validation'), () => {
      const input = validRequest()
      const output = validRequest()
      expect(func(input)).toLooseEqual(outFormatter(output))
    })

    it(title('pass validation without parents'), () => {
      const input = { name: validRequest().name, parents: [] }
      const output = { ...input }
      expect(func(input)).toLooseEqual(outFormatter(output))
    })

    function fail (style: unknown) {
      expectThrow(() => func(style), invalidStyleError)
    }

    it(title('fail with empty name'), () => {
      const style = {
        ...validRequest(),
        name: ''
      }
      fail(style)
    })

    it(title('fail without name'), () => {
      const { parents } = validRequest()
      fail({ parents })
    })

    it(title('fail with invalid name'), () => {
      const style = {
        ...validRequest(),
        name: 123
      }
      fail(style)
    })

    it(title('fail without parents property'), () => {
      const { name } = validRequest()
      fail({ name })
    })

    it(title('fail with invalid parents'), () => {
      const style = {
        ...validRequest(),
        parents: [ 123 ]
      }
      fail(style)
    })
  })

  it('fail update with undefined style id', () => {
    expectThrow(
      () => validateUpdateStyleRequest(validRequest(), undefined),
      invalidStyleIdError
    )
  })

  it('fail update with empty style id', () => {
    expectThrow(
      () => validateUpdateStyleRequest(validRequest(), ''),
      invalidStyleIdError
    )
  })
})
