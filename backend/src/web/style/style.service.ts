import { v4 as uuidv4 } from 'uuid'

import * as styleRepository from '../../data/style/style.repository'

import { type Database, type Transaction } from '../../data/database'
import {
  type CreateStyleRequest,
  type Style,
  type StyleWithParentsAndChildren,
  type StyleWithParentIds,
  type UpdateStyleRequest
} from '../../core/style/style'
import { type StyleRow } from '../../data/style/style.table'
import { checkCyclicRelationships } from '../../core/style/style.util'

export async function createStyle (
  trx: Transaction,
  request: CreateStyleRequest
): Promise<StyleWithParentIds> {
  const uuid = uuidv4()
  await validateRelationships(trx, uuid, request.parents)

  const style = await styleRepository.insertStyle(trx, {
    name: request.name
  })

  if (request.parents.length > 0) {
    await styleRepository.insertStyleRelationships(trx, request.parents.map(parent => ({
        parent,
        child: style.style_id
      })))
  }

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
  await validateRelationships(trx, styleId, request.parents)

  const style = await styleRepository.updateStyle(trx, styleId, {
    name: request.name
  })

  await Promise.all([
    styleRepository.deleteStyleChildRelationships(trx, styleId),
    request.parents.length === 0 ? () => {} :
    styleRepository.insertStyleRelationships(trx, request.parents.map(parent => ({
        parent,
        child: style.style_id
    })))
  ])

  return {
    ...styleRowToStyle(style),
    parents: request.parents ?? []
  }
}

export async function findStyleById (
  db: Database,
  styleId: string
): Promise<StyleWithParentsAndChildren | undefined> {
  const style = await styleRepository.findStyleById(db, styleId)

  if (style === null || style === undefined) return undefined

  return style
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
