import type {
  CreateContainerRequest,
  UpdateContainerRequest,
  Container
} from '../../container/container'

import { containerNotFoundError } from '../../errors'
import { INFO } from '../../log'
import type { log } from '../../log'

export async function createContainer (
  create: (container: CreateContainerRequest) => Promise<Container>,
  request: CreateContainerRequest,
  log: log
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
  request: UpdateContainerRequest,
  log: log
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
  containerId: string,
  log: log
): Promise<Container> {
  log(INFO, 'find container with id', containerId)
  const container = await find(containerId)

  if (container === undefined) throw containerNotFoundError(containerId)

  return container
}

export async function listContainers (
  list: () => Promise<Container[]>,
  log: log
): Promise<Container[]> {
  log(INFO, 'list containers')
  return await list()
}
