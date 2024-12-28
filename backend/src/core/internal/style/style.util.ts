import type { StyleRelationship } from '../../style'

import { cyclicRelationshipError } from '../../errors'
import { contains } from '../../record'

interface Style {
  id: string
  parents: string[]
}

export function checkCyclicRelationships (
  currentRelationships: StyleRelationship[],
  styleId: string,
  parents: string[]
): void {
  const relationships = currentRelationships.filter(
    (row: StyleRelationship) => row.child !== styleId)

  parents.forEach(parent => {
    relationships.push({
      child: styleId,
      parent
    })
  })

  function newStyleFromId (id: string): Style {
    return {
      id,
      parents: []
    }
  }

  const relationshipMap: Record<string, Style> = {}
  relationships.forEach((relationship: StyleRelationship) => {
    if (!contains(relationshipMap, relationship.child)) {
      relationshipMap[relationship.child] = newStyleFromId(relationship.child)
    }
    relationshipMap[relationship.child].parents.push(relationship.parent)
    if (!contains(relationshipMap, relationship.parent)) {
      relationshipMap[relationship.parent] = newStyleFromId(relationship.parent)
    }
  })

  Object.keys(relationshipMap).forEach((id: string) => {
    const styles: Record<string, boolean> = {}
    const checkStyle = (style: Style): void => {
      if (styles[style.id]) {
        throw cyclicRelationshipError
      }
      styles[style.id] = true
      style.parents.forEach(parentId => {
        checkStyle(relationshipMap[parentId])
      })
    }
    checkStyle(relationshipMap[id])
  })
}
