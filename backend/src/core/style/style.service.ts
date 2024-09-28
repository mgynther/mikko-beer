import { v4 as uuidv4 } from 'uuid'

import type {
  CreateStyleRequest,
  NewStyle,
  Style,
  StyleRelationship,
  StyleWithParentsAndChildren,
  StyleWithParentIds,
  UpdateStyleRequest
} from './style'

import {
  parentStyleNotFoundError,
  styleNotFoundError
} from '../errors'
import { INFO, type log } from '../log'
import { checkCyclicRelationships } from './style.util'
import { areKeysEqual } from '../key'

export interface CreateStyleIf {
  create: (style: NewStyle) => Promise<Style>
  lockStyles: lockStyles
  insertParents: (styleId: string, parents: string[]) => Promise<void>
  listAllRelationships: () => Promise<StyleRelationship[]>
}

type lockStyles = (styleIds: string[]) => Promise<string[]>

export async function createStyle (
  createStyleIf: CreateStyleIf,
  request: CreateStyleRequest,
  log: log
): Promise<StyleWithParentIds> {
  log(
    INFO,
    'create style with name',
    request.name,
    'and parents',
    request.parents
  )
  const styleId = uuidv4()

  if (request.parents.length > 0) {
    await lockParents(createStyleIf.lockStyles, request.parents)
  }

  const allRelationships = await createStyleIf.listAllRelationships()
  validateRelationships(allRelationships, styleId, request.parents)

  const style = await createStyleIf.create({
    name: request.name
  })

  if (request.parents.length > 0) {
    await createStyleIf.insertParents(style.id, request.parents)
  }

  log(INFO, 'created style', style.id)
  return {
    ...style,
    parents: request.parents
  }
}

export interface UpdateStyleIf {
  update: (style: Style) => Promise<Style>
  lockStyles: lockStyles
  insertParents: (styleId: string, parents: string[]) => Promise<void>
  listAllRelationships: () => Promise<StyleRelationship[]>
  deleteStyleChildRelationships: (styleId: string) => Promise<void>
}

export async function updateStyle (
  updateStyleIf: UpdateStyleIf,
  styleId: string,
  request: UpdateStyleRequest,
  log: log
): Promise<StyleWithParentIds> {
  log(INFO, 'update style', styleId)
  if (request.parents.length > 0) {
    await lockParents(updateStyleIf.lockStyles, request.parents)
  }
  const allRelationships = await updateStyleIf.listAllRelationships()
  validateRelationships(allRelationships, styleId, request.parents)

  const style = await updateStyleIf.update({
    id: styleId,
    name: request.name
  })

  await Promise.all([
    updateStyleIf.deleteStyleChildRelationships(styleId),
    request.parents.length === 0
      ? () => undefined
      : updateStyleIf.insertParents(style.id, request.parents)
  ])

  log(INFO, 'updated style', style.id)
  return {
    ...style,
    parents: request.parents
  }
}

export async function findStyleById (
  find: (id: string) => Promise<StyleWithParentsAndChildren | undefined>,
  styleId: string,
  log: log
): Promise<StyleWithParentsAndChildren> {
  log(INFO, 'find style', styleId)
  const style = await find(styleId)

  if (style === undefined) throw styleNotFoundError(styleId)

  return style
}

export async function listStyles (
  list: () => Promise<StyleWithParentIds[]>,
  log: log
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

async function lockParents (
  lockStyles: lockStyles,
  parentKeys: string[]
): Promise<void> {
  const lockedParents = await lockStyles(parentKeys)
  if (!areKeysEqual(lockedParents, parentKeys)) {
    throw parentStyleNotFoundError
  }
}
