import {
  type CreateContainerRequest,
  type UpdateContainerRequest,
  type Container,
  type NewContainer
} from './container'

import { INFO, log } from '../log'

export async function createContainer (
  create: (container: NewContainer) => Promise<Container>,
  request: CreateContainerRequest
): Promise<Container> {
  log(INFO, 'create container', request)
  const container = await create({
    type: request.type,
    size: request.size
  })

  log(INFO, 'created container with id', container.id)
  return { ...container }
}

export async function updateContainer (
  update: (container: Container) => Promise<Container>,
  containerId: string,
  request: UpdateContainerRequest
): Promise<Container> {
  log(INFO, 'update container with id', containerId)
  const container = await update({
    id: containerId,
    type: request.type,
    size: request.size
  })

  log(INFO, 'updated container with id', containerId)
  return { ...container }
}

export async function findContainerById (
  find: (id: string) => Promise<Container | undefined>,
  containerId: string
): Promise<Container | undefined> {
  log(INFO, 'find container with id', containerId)
  const container = await find(containerId)

  if (container === undefined) return undefined

  return container
}

export async function listContainers (
  list: () => Promise<Container[]>
): Promise<Container[]> {
  log(INFO, 'list containers')
  return await list()
}
