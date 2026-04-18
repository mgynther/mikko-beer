import type { StyleRelationship } from '../../style/style.js'

import { cyclicRelationshipError } from '../../errors.js'
import { hasCycleDfs } from './style-tree-dfs.js'

export function checkCyclicRelationships(
  currentRelationships: StyleRelationship[],
  styleId: string,
  parents: string[],
): void {
  const relationships = currentRelationships.filter(
    (row: StyleRelationship) => row.child !== styleId,
  )

  parents.forEach((parent) => {
    relationships.push({
      child: styleId,
      parent,
    })
  })

  if (hasCycleDfs(relationships)) {
    throw cyclicRelationshipError
  }
}
