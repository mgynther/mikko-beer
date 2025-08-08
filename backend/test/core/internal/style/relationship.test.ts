import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { cyclicRelationshipError } from '../../../../src/core/errors'
import {
  checkCyclicRelationships
} from '../../../../src/core/internal/style/style.util'
import { expectThrow } from '../../controller-error-helper'

describe('style relationship unit tests', () => {
  const ale = {
    id: '7b6af078-0b6d-4171-8818-0288da190480',
    name: 'Ale',
  }
  const ipa = {
    id: 'b38805f4-b401-46aa-b536-7023cf7cb7ed',
    name: 'IPA',
  }
  const neipa = {
    id: 'b16cbbfa-ac18-44e0-806e-ed7df7b64b2d',
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
    assert.doesNotThrow(() => checkCyclicRelationships(relationships, neipa.id, [ipa.id]))
  })

  it('find cyclic when there is a cycle', () => {
    expectThrow(
      () => checkCyclicRelationships(relationships, ale.id, [neipa.id])
    , cyclicRelationshipError)
  })
})
