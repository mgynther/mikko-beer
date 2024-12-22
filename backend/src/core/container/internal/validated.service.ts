import * as containerService from './service'

import type { Container, NewContainer } from '../container';
import {
  validateContainerId,
  validateCreateContainerRequest,
  validateUpdateContainerRequest
} from '../container';
import type { log } from '../../log'

export async function createContainer (
  create: (container: NewContainer) => Promise<Container>,
  body: unknown,
  log: log
): Promise<Container> {
  const createRequest = validateCreateContainerRequest(body)
  return await containerService.createContainer(create, createRequest, log)
}

export async function updateContainer (
  update: (container: Container) => Promise<Container>,
  id: string | undefined,
  body: unknown,
  log: log
): Promise<Container> {
  const validRequest = validateUpdateContainerRequest(body, id)
  return await containerService.updateContainer(
    update,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findContainerById (
  find: (id: string) => Promise<Container | undefined>,
  id: string | undefined,
  log: log
): Promise<Container> {
  return await containerService.findContainerById(
    find,
    validateContainerId(id),
    log
  )
}

export async function listContainers (
  list: () => Promise<Container[]>,
  log: log
): Promise<Container[]> {
  return await containerService.listContainers(list, log)
}
