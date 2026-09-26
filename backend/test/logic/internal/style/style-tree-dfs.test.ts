import { suite, test } from '../../../test.js'
import { assertEqual } from '../../../assert.js'
import { hasCycleDfs } from '../../../../src/logic/internal/style/style-tree-dfs.js'
import type { StyleRelationship } from '../../../../src/logic/style/style.js'

suite('style tree depth-first search unit tests', () => {
  // Although uuids are actually used in the implementation, here we work on
  // human-readable style names to make it easier to debug if needed.
  const ale = 'ale'
  const ipa = 'ipa'
  const americanIpa = 'american ipa'
  const hazyIpa = 'hazy ipa'
  const neipa = 'neipa'
  const westCoastIpa = 'west coast ipa'

  test('no cycle in no relationships', () => {
    assertEqual(hasCycleDfs([]), false)
  })

  test('cycle in self relationship', () => {
    assertEqual(hasCycleDfs([{ parent: 'same', child: 'same' }]), true)
  })

  const basicRelationships: StyleRelationship[] = [
    {
      parent: ale,
      child: ipa,
    },
  ]
  test('no cycle in single relationship', () => {
    assertEqual(hasCycleDfs(basicRelationships), false)
  })

  test('cycle in simple cycle', () => {
    assertEqual(
      hasCycleDfs([
        { parent: '1', child: '2' },
        { parent: '2', child: '1' },
      ]),
      true,
    )
  })

  const threeLevelRelationships: StyleRelationship[] = [
    ...basicRelationships,
    {
      parent: ipa,
      child: americanIpa,
    },
  ]

  test('no cycle in three level relationship', () => {
    assertEqual(hasCycleDfs(threeLevelRelationships), false)
  })

  const commonParentRelationships: StyleRelationship[] = [
    ...threeLevelRelationships,
    {
      parent: americanIpa,
      child: westCoastIpa,
    },
    {
      parent: americanIpa,
      child: neipa,
    },
  ]

  test('no cycle in common parent relationship', () => {
    assertEqual(hasCycleDfs(commonParentRelationships), false)
  })

  const diamondRelationships: StyleRelationship[] = [
    ...commonParentRelationships,
    {
      parent: ipa,
      child: hazyIpa,
    },
    {
      parent: hazyIpa,
      child: neipa,
    },
  ]

  test('no cycle in diamond relationships', () => {
    assertEqual(hasCycleDfs(diamondRelationships), false)
  })

  test('cycle in complex graph', () => {
    const relationships = [
      ...diamondRelationships,
      {
        parent: neipa,
        child: ale,
      },
    ]
    assertEqual(hasCycleDfs(relationships), true)
  })
})
