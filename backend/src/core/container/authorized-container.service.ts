import * as authService from '../../core/authentication/authentication.service'
import * as containerService from '../../core/container/container.service'

import type { BodyRequest, IdRequest } from '../request';
import type { Container, NewContainer } from './container';
import {
  validateContainerId,
  validateCreateContainerRequest,
  validateUpdateContainerRequest
} from './container';
import type { log } from '../log'
import type { AuthTokenPayload } from '../authentication/auth-token';

export async function createContainer (
  create: (container: NewContainer) => Promise<Container>,
  request: BodyRequest,
  log: log
): Promise<Container> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const createRequest = validateCreateContainerRequest(request.body)
  return await containerService.createContainer(create, createRequest, log)
}

export async function updateContainer (
  update: (container: Container) => Promise<Container>,
  request: IdRequest,
  body: unknown,
  log: log
): Promise<Container> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const validRequest = validateUpdateContainerRequest(body, request.id)
  return await containerService.updateContainer(
    update,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findContainerById (
  find: (id: string) => Promise<Container | undefined>,
  request: IdRequest,
  log: log
): Promise<Container> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await containerService.findContainerById(
    find,
    validateContainerId(request.id),
    log
  )
}

export async function listContainers (
  list: () => Promise<Container[]>,
  authTokenPayload: AuthTokenPayload,
  log: log
): Promise<Container[]> {
  authService.authenticateViewerPayload(authTokenPayload)
  return await containerService.listContainers(list, log)
}
