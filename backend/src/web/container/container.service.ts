import * as containerRepository from '../../data/container/container.repository'

import { type Database, type Transaction } from '../../data/database'
import {
  type CreateContainerRequest,
  type Container,
  type UpdateContainerRequest
} from '../../core/container/container'
import { type ContainerRow } from '../../data/container/container.table'

export async function createContainer (
  trx: Transaction,
  request: CreateContainerRequest
): Promise<Container> {
  const container = await containerRepository.insertContainer(trx, {
    type: request.type,
    size: request.size
  })

  return {
    ...containerRowToContainer(container)
  }
}

export async function updateContainer (
  trx: Transaction,
  containerId: string,
  request: UpdateContainerRequest
): Promise<Container> {
  const container = await containerRepository.updateContainer(
    trx,
    containerId,
    {
      type: request.type,
      size: request.size
    }
  )

  return {
    ...containerRowToContainer(container)
  }
}

export async function findContainerById (
  db: Database,
  containerId: string
): Promise<Container | undefined> {
  const container = await containerRepository.findContainerById(db, containerId)

  if (container === null || container === undefined) return undefined

  return container
}

export async function listContainers (
  db: Database
): Promise<Container[] | undefined> {
  const containers = await containerRepository.listContainers(db)

  if (containers === null || containers === undefined) return []

  return containers.map(containerRowToContainer)
}

export function containerRowToContainer (container: ContainerRow): Container {
  return {
    id: container.container_id,
    type: container.type,
    size: container.size
  }
}
