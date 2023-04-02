import { type StyleRelationshipRow } from './style.table'

export class CyclicRelationshipError extends Error {
}

interface Style {
  id: string
  parents: string[]
}

export function checkCyclicRelationships (
  currentRelationships: StyleRelationshipRow[],
  styleId: string,
  parents: string[]
): void {
  const relationships = currentRelationships.filter(
    (row: StyleRelationshipRow) => {
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
  relationships.forEach((relationship: StyleRelationshipRow) => {
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
      throw new CyclicRelationshipError('Cyclic relationship found')
    }
  })
}
