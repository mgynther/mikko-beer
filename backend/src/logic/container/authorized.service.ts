import * as authorizationService from '../internal/auth/authorization.service.js'
import * as containerService from '../internal/container/validated.service.js'

import type { BodyRequest, IdRequest } from '../request'
import type {
  Container,
  CreateContainerRequest,
  ValidateContainerId,
  ValidateCreateContainer,
  ValidateUpdateContainer,
} from './container.js'
import type { log } from '../log.js'
import type { AuthTokenPayload } from '../auth/auth-token.js'

export async function createContainer(
  create: (container: CreateContainerRequest) => Promise<Container>,
  validate: ValidateCreateContainer,
  request: BodyRequest,
  log: log,
): Promise<Container> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await containerService.createContainer(
    create,
    validate,
    request.body,
    log,
  )
}

export async function updateContainer(
  update: (container: Container) => Promise<Container>,
  validate: ValidateUpdateContainer,
  request: IdRequest,
  body: unknown,
  log: log,
): Promise<Container> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await containerService.updateContainer(
    update,
    validate,
    request.id,
    body,
    log,
  )
}

export async function findContainerById(
  find: (id: string) => Promise<Container | undefined>,
  validateId: ValidateContainerId,
  request: IdRequest,
  log: log,
): Promise<Container> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await containerService.findContainerById(
    find,
    validateId,
    request.id,
    log,
  )
}

export async function listContainers(
  list: () => Promise<Container[]>,
  authTokenPayload: AuthTokenPayload,
  log: log,
): Promise<Container[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await containerService.listContainers(list, log)
}
