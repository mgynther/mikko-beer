import * as authorizationService from '../internal/auth/authorization.service.js'
import * as containerService from '../internal/container/validated.service.js'

import type { BodyRequest, IdRequest } from '../request'
import type { Container, CreateContainerRequest } from './container.js'
import type { log } from '../log.js'
import type { AuthTokenPayload } from '../auth/auth-token.js'

export async function createContainer(
  create: (container: CreateContainerRequest) => Promise<Container>,
  request: BodyRequest,
  log: log,
): Promise<Container> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await containerService.createContainer(create, request.body, log)
}

export async function updateContainer(
  update: (container: Container) => Promise<Container>,
  request: IdRequest,
  body: unknown,
  log: log,
): Promise<Container> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await containerService.updateContainer(update, request.id, body, log)
}

export async function findContainerById(
  find: (id: string) => Promise<Container | undefined>,
  request: IdRequest,
  log: log,
): Promise<Container> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await containerService.findContainerById(find, request.id, log)
}

export async function listContainers(
  list: () => Promise<Container[]>,
  authTokenPayload: AuthTokenPayload,
  log: log,
): Promise<Container[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await containerService.listContainers(list, log)
}
