import { type StyleRelationship } from './style'

import { cyclicRelationshipError } from '../errors'

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
    (row: StyleRelationship) => {
      return row.child !== styleId
    })

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
    if (relationshipMap[relationship.child] === undefined) {
      relationshipMap[relationship.child] = newStyleFromId(relationship.child)
    }
    relationshipMap[relationship.child].parents.push(relationship.parent)
    if (relationshipMap[relationship.parent] === undefined) {
      relationshipMap[relationship.parent] = newStyleFromId(relationship.parent)
    }
  })

  Object.keys(relationshipMap).forEach((id: string) => {
    const style = relationshipMap[id]
    const styles: Record<string, boolean> = {}
    let hasCyclic = false
    const checkStyle = (style: Style): void => {
      if (hasCyclic) return
      if (styles[style.id]) {
        hasCyclic = true
        return
      }
      styles[style.id] = true
      style.parents.forEach(parentId => {
        const parent = relationshipMap[parentId]
        checkStyle(parent)
      })
    }
    checkStyle(style)
    if (hasCyclic) {
      throw cyclicRelationshipError
    }
  })
}
