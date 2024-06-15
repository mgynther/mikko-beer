import { type Database, type Transaction } from '../database'
import {
  type ContainerRow
} from './container.table'
import {
  type Container, type NewContainer
} from '../../core/container/container'

export async function insertContainer (
  trx: Transaction,
  container: NewContainer
): Promise<Container> {
  const insertedContainer = await trx.trx()
    .insertInto('container')
    .values(container)
    .returningAll()
    .executeTakeFirstOrThrow()

  return toContainer(insertedContainer)
}

export async function updateContainer (
  trx: Transaction,
  container: Container
): Promise<Container> {
  const updatedContainer = await trx.trx()
    .updateTable('container')
    .set({
      type: container.type,
      size: container.size
    })
    .where('container_id', '=', container.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return toContainer(updatedContainer)
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

  return toContainer(container)
}

export async function listContainers (
  db: Database
): Promise<Container[]> {
  const containers = await db.getDb()
    .selectFrom('container')
    .select(['container_id', 'type', 'size', 'container.created_at'])
    .orderBy('type', 'asc')
    .orderBy('size', 'asc')
    .execute()

  return containers.map(toContainer)
}

function toContainer (row: ContainerRow): Container {
  return {
    id: row.container_id,
    type: row.type ?? '',
    size: row.size ?? ''
  }
}
