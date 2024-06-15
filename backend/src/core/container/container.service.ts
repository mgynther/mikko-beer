import {
  type CreateContainerRequest,
  type UpdateContainerRequest,
  type Container,
  type NewContainer
} from './container'

export async function createContainer (
  create: (container: NewContainer) => Promise<Container>,
  request: CreateContainerRequest
): Promise<Container> {
  const container = await create({
    type: request.type,
    size: request.size
  })

  return { ...container }
}

export async function updateContainer (
  update: (container: Container) => Promise<Container>,
  containerId: string,
  request: UpdateContainerRequest
): Promise<Container> {
  const container = await update({
    id: containerId,
    type: request.type,
    size: request.size
  })

  return { ...container }
}

export async function findContainerById (
  find: (id: string) => Promise<Container | undefined>,
  containerId: string
): Promise<Container | undefined> {
  const container = await find(containerId)

  if (container === undefined) return undefined

  return container
}

export async function listContainers (
  list: () => Promise<Container[]>
): Promise<Container[]> {
  return await list()
}
