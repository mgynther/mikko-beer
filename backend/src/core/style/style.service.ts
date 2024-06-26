import { v4 as uuidv4 } from 'uuid'

import {
  type CreateStyleRequest,
  type NewStyle,
  type Style,
  type StyleRelationship,
  type StyleWithParentsAndChildren,
  type StyleWithParentIds,
  type UpdateStyleRequest
} from './style'

import { INFO, log } from '../log'
import { checkCyclicRelationships } from './style.util'

export interface CreateRelationshipIf {
  insert: (styleId: string, parents: string[]) => Promise<void>
  listAllRelationships: () => Promise<StyleRelationship[]>
}

export async function createStyle (
  create: (style: NewStyle) => Promise<Style>,
  relationshipHandlers: CreateRelationshipIf,
  request: CreateStyleRequest
): Promise<StyleWithParentIds> {
  log(
    INFO,
    'create style with name',
    request.name,
    'and parents',
    request.parents
  )
  const styleId = uuidv4()
  const allRelationships = await relationshipHandlers.listAllRelationships()
  validateRelationships(allRelationships, styleId, request.parents)

  const style = await create({
    name: request.name
  })

  if (request.parents.length > 0) {
    await relationshipHandlers.insert(style.id, request.parents)
  }

  log(INFO, 'created style', style.id)
  return {
    ...style,
    parents: request.parents
  }
}

export interface UpdateRelationshipIf extends CreateRelationshipIf {
  deleteStyleChildRelationships: (styleId: string) => Promise<void>
}

export async function updateStyle (
  update: (style: Style) => Promise<Style>,
  relationshipHandlers: UpdateRelationshipIf,
  styleId: string,
  request: UpdateStyleRequest
): Promise<StyleWithParentIds> {
  log(INFO, 'update style', styleId)
  const allRelationships = await relationshipHandlers.listAllRelationships()
  validateRelationships(allRelationships, styleId, request.parents)

  const style = await update({
    id: styleId,
    name: request.name
  })

  await Promise.all([
    relationshipHandlers.deleteStyleChildRelationships(styleId),
    request.parents.length === 0
      ? () => {}
      : relationshipHandlers.insert(style.id, request.parents)
  ])

  log(INFO, 'updated style', style.id)
  return {
    ...style,
    parents: request.parents
  }
}

export async function findStyleById (
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  styleId: string
): Promise<StyleWithParentsAndChildren | undefined> {
  log(INFO, 'find style', styleId)
  const style = await find(styleId)

  if (style === undefined) return undefined

  return style
}

export async function listStyles (
  list: () => Promise<StyleWithParentIds[]>
): Promise<StyleWithParentIds[]> {
  log(INFO, 'list styles')
  return await list()
}

function validateRelationships (
  allRelationships: StyleRelationship[],
  styleId: string,
  parents: string[]
): void {
  checkCyclicRelationships(allRelationships, styleId, parents)
}
