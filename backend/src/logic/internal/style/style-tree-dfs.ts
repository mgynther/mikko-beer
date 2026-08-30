import type { StyleRelationship } from '../../style/style'

// See:
// https://en.wikipedia.org/wiki/Topological_sorting
// https://en.wikipedia.org/wiki/Depth-first_search
export function hasCycleDfs(relationships: StyleRelationship[]): boolean {
  const styleChildrenMap: Map<string, string[]> = new Map()
  const styles: Set<string> = new Set()

  relationships.forEach((relationship) => {
    const children: string[] = styleChildrenMap.get(relationship.parent) ?? []
    children.push(relationship.child)
    styleChildrenMap.set(relationship.parent, children)
    styles.add(relationship.parent)
    styles.add(relationship.child)
  })

  // Set for already checked and cycle free parts of the full graph. There are
  // no cycles in these styles and their children, parents are not considered
  // which means every style needs to be checked. However, this set makes search
  // trivial when visiting the same parts of the graph again. Upon finding a
  // cycle this set will likely be incorrect but assuming recursion is stopped
  // it does not matter as long as reporting the cycles back is not needed.
  const cycleFreeStylesInChildren: Set<string> = new Set()
  // Work stack for current traversal. Will be pushed and popped as needed,
  // pushed on visiting a style and popped when finding a style and its children
  // cycle free. Enables finding cycles by storing already visited styles in
  // the current traversal.
  const visitedStyleStack: Set<string> = new Set()

  // Recursive function to traverse all paths into children of each style, one
  // style at a time. Cycle free styles will be book-kept so the same paths are
  // not walked multiple times. Book-keeping on visited styles enables finding a
  // cycle when there is one. Upon finding a cycle recursion will simply unfold.
  function hasCycle(style: string): boolean {
    if (visitedStyleStack.has(style)) {
      return true
    }
    if (cycleFreeStylesInChildren.has(style)) {
      return false
    }
    visitedStyleStack.add(style)
    const children: string[] = styleChildrenMap.get(style) ?? []
    for (const child of children) {
      if (hasCycle(child)) {
        return true
      }
    }
    visitedStyleStack.delete(style)
    cycleFreeStylesInChildren.add(style)
    return false
  }

  for (const style of styles) {
    if (hasCycle(style)) {
      return true
    }
  }

  return false
}
