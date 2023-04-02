import { v4 as uuidv4 } from 'uuid'

import * as styleRepository from './style.repository'

import { type Database, type Transaction } from '../database'
import {
  type CreateStyleRequest,
  type Style,
  type StyleWithParents,
  type StyleWithParentIds,
  type UpdateStyleRequest
} from './style'
import { type StyleRow } from './style.table'
import { checkCyclicRelationships } from './style.util'

export async function createStyle (
  trx: Transaction,
  request: CreateStyleRequest
): Promise<StyleWithParentIds> {
  const uuid = uuidv4()
  await validateRelationships(trx, uuid, request.parents ?? [])

  const style = await styleRepository.insertStyle(trx, {
    name: request.name
  })

  // TODO It might be a good idea to insert all on one request.
  const relationships = (request.parents != null)
    ? request.parents.map(async (parent) => {
      return await styleRepository.insertStyleRelationship(trx, {
        parent,
        child: style.style_id
      })
    })
    : []
  await Promise.all(relationships)

  return {
    ...styleRowToStyle(style),
    parents: request.parents ?? []
  }
}

export async function updateStyle (
  trx: Transaction,
  styleId: string,
  request: UpdateStyleRequest
): Promise<StyleWithParentIds> {
  await validateRelationships(trx, styleId, request.parents ?? [])

  const style = await styleRepository.updateStyle(trx, styleId, {
    name: request.name
  })

  await styleRepository.deleteStyleChildRelationships(trx, styleId)

  // TODO It might be a good idea to insert all on one request.
  const relationships = (request.parents != null)
    ? request.parents.map(async (parent) => {
      return await styleRepository.insertStyleRelationship(trx, {
        parent,
        child: style.style_id
      })
    })
    : []
  await Promise.all(relationships)

  return {
    ...styleRowToStyle(style),
    parents: request.parents ?? []
  }
}

export async function findStyleById (
  db: Database,
  styleId: string
): Promise<StyleWithParents | undefined> {
  const style = await styleRepository.findStyleById(db, styleId)

  if (style === null || style === undefined) return undefined

  return style
}

export async function lockStyleById (
  trx: Transaction,
  id: string
): Promise<Style | undefined> {
  const styleRow = await styleRepository.lockStyleById(trx, id)

  if (styleRow != null) {
    return styleRowToStyle(styleRow)
  }
}

export async function listStyles (
  db: Database
): Promise<StyleWithParentIds[] | undefined> {
  const styles = await styleRepository.listStyles(db)

  if (styles === null || styles === undefined) return []

  return styles
}

export function styleRowToStyle (style: StyleRow): Style {
  return {
    id: style.style_id,
    name: style.name
  }
}

async function validateRelationships (
  trx: Transaction,
  styleId: string,
  parents: string[]
): Promise<void> {
  const currentRelationships = await styleRepository.listStyleRelationships(trx)

  checkCyclicRelationships(currentRelationships, styleId, parents)
}
