import { type Database, type Transaction } from '../database'
import {
  type InsertableStyleRow,
  type InsertableStyleRelationshipRow,
  type StyleRow,
  type StyleRelationshipRow,
  type UpdateableStyleRow
} from './style.table'
import {
  type StyleWithParentIds,
  type StyleWithParentsAndChildren
} from '../../core/style/style'

export async function insertStyle (
  trx: Transaction,
  style: InsertableStyleRow
): Promise<StyleRow> {
  const insertedStyle = await trx.trx()
    .insertInto('style')
    .values(style)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedStyle
}

export async function insertStyleRelationship (
  trx: Transaction,
  styleRelationship: InsertableStyleRelationshipRow
): Promise<StyleRelationshipRow> {
  const insertedStyle = await trx.trx()
    .insertInto('style_relationship')
    .values(styleRelationship)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedStyle
}

export async function deleteStyleChildRelationships (
  trx: Transaction,
  styleId: string
): Promise<void> {
  await trx.trx()
    .deleteFrom('style_relationship')
    .where('style_relationship.child', '=', styleId)
    .execute()
}

export async function listStyleRelationships (
  trx: Transaction
): Promise<StyleRelationshipRow[]> {
  return await trx.trx()
    .selectFrom('style_relationship')
    .selectAll()
    .execute()
}

export async function updateStyle (
  trx: Transaction,
  id: string,
  style: UpdateableStyleRow
): Promise<StyleRow> {
  const updatedStyle = await trx.trx()
    .updateTable('style')
    .set({
      name: style.name
    })
    .where('style_id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedStyle
}

export async function findStyleById (
  db: Database,
  id: string
): Promise<StyleWithParentsAndChildren | undefined> {
  const stylePromise = db.getDb()
    .selectFrom('style')
    .where('style_id', '=', id)
    .selectAll('style')
    .executeTakeFirst()

  const childrenPromise = db.getDb()
    .selectFrom('style_relationship')
    .innerJoin('style', 'style_relationship.child', 'style.style_id')
    .where('style_relationship.parent', '=', id)
    .selectAll('style')
    .execute()

  const parentsPromise = db.getDb()
    .selectFrom('style_relationship')
    .innerJoin('style', 'style_relationship.parent', 'style.style_id')
    .where('style_relationship.child', '=', id)
    .selectAll('style')
    .execute()

  const [style, children, parents] =
    await Promise.all([stylePromise, childrenPromise, parentsPromise])

  if (style === null || style === undefined) return undefined

  return {
    id: style.style_id,
    name: style.name,
    children: children.map(child => ({
      id: child.style_id,
      name: child.name
    })),
    parents: parents.map(parent => ({
      id: parent.style_id,
      name: parent.name
    }))
  }
}

export async function listStyles (
  db: Database
): Promise<StyleWithParentIds[] | undefined> {
  const styles = await db.getDb()
    .selectFrom('style')
    .leftJoin(
      'style_relationship',
      'style.style_id',
      'style_relationship.child'
    )
    .select([
      'style_id',
      'name',
      'style.created_at',
      'style_relationship.parent as parent'
    ])
    .execute()

  if (styles.length === 0) {
    return undefined
  }

  const styleMap: Record<string, StyleWithParentIds> = {}
  const styleArray: StyleWithParentIds[] = []
  styles.forEach(style => {
    if (styleMap[style.style_id] === undefined) {
      styleMap[style.style_id] = {
        id: style.style_id,
        name: style.name,
        parents: [style.parent].filter(parent => parent) as string[]
      }
      styleArray.push(styleMap[style.style_id])
    } else {
      styleMap[style.style_id].parents = [
        ...styleMap[style.style_id].parents,
        style.parent
      ].filter(parent => parent) as string[]
    }
  })

  return styleArray
}
