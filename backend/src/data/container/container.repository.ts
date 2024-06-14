import { type Database, type Transaction } from '../database'
import {
  type InsertableContainerRow,
  type ContainerRow,
  type UpdateableContainerRow
} from './container.table'
import { type Container } from '../../core/container/container'

export async function insertContainer (
  trx: Transaction,
  container: InsertableContainerRow
): Promise<ContainerRow> {
  const insertedContainer = await trx.trx()
    .insertInto('container')
    .values(container)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedContainer
}

export async function updateContainer (
  trx: Transaction,
  id: string,
  container: UpdateableContainerRow
): Promise<ContainerRow> {
  const updatedContainer = await trx.trx()
    .updateTable('container')
    .set({
      type: container.type,
      size: container.size
    })
    .where('container_id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedContainer
}

export async function findContainerById (
  db: Database,
  id: string
): Promise<Container | undefined> {
  const containers = await db.getDb()
    .selectFrom('container')
    .where('container.container_id', '=', id)
    .select(['container_id', 'type', 'size', 'container.created_at'])
    .execute()

  if (containers.length === 0) {
    return undefined
  }

  const container = containers.find(container => container.container_id === id)

  if (container === null || container === undefined) return undefined

  return {
    id: container.container_id,
    type: container.type,
    size: container.size
  }
}

export async function listContainers (
  db: Database
): Promise<ContainerRow[] | undefined> {
  const containers = await db.getDb()
    .selectFrom('container')
    .select(['container_id', 'type', 'size', 'container.created_at'])
    .orderBy('type', 'asc')
    .orderBy('size', 'asc')
    .execute()

  if (containers.length === 0) {
    return undefined
  }

  return containers
}
