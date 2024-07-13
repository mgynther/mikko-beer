import { expect } from 'earl'
import { v4 as uuidv4 } from 'uuid'

import {
  validateCreateStyleRequest,
  validateUpdateStyleRequest
} from '../../../src/core/style/style'
import {
  cyclicRelationshipError,
  invalidStyleError,
} from '../../../src/core/errors'
import { checkCyclicRelationships } from '../../../src/core/style/style.util'
import { expectThrow } from '../controller-error-helper'

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
      title: (base: string) => `${base}: create`
    },
    {
      func: (request: unknown) => {
        const id = 'c8e02862-7fe7-44d5-b0eb-cd23e72faf56'
        return validateUpdateStyleRequest(request, id)
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

    it(title('pass validation without parents'), () => {
      const input = { name: validRequest().name, parents: [] }
      const output = { ...input }
      expect(func(input)).toLooseEqual(output)
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
})
