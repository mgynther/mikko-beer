import { expect } from 'chai'
import { v4 as uuidv4 } from 'uuid'

import { checkCyclicRelationships } from '../../../src/core/style/style.util'

describe('style unit tests', () => {
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

  it('should not find cyclic when there is no cycle', () => {
    expect(() => checkCyclicRelationships(relationships, neipa.id, [ipa.id])).to.not.throw()
  })

  it('should find cyclic when there is a cycle', () => {
    expect(() => checkCyclicRelationships(relationships, ale.id, [neipa.id])).to.throw()
  })
})
