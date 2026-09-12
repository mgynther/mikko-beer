import * as containerService from './service.js'

import type {
  Container,
  CreateContainerRequest,
  CreateContainerValidationResult,
  UpdateContainerValidationResult,
  ValidateContainerId,
} from '../../container/container.js'
import type { log } from '../../log.js'
import { invalidContainerError, invalidContainerIdError } from '../../errors.js'

export async function createContainer(
  create: (container: CreateContainerRequest) => Promise<Container>,
  validate: (body: unknown) => CreateContainerValidationResult,
  body: unknown,
  log: log,
): Promise<Container> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-container') {
    throw invalidContainerError
  }
  return await containerService.createContainer(
    create,
    validationResult.result,
    log,
  )
}

export async function updateContainer(
  update: (container: Container) => Promise<Container>,
  validate: (
    body: unknown,
    id: string | undefined,
  ) => UpdateContainerValidationResult,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<Container> {
  const validationResult = validate(body, id)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-container':
        throw invalidContainerError
      case 'invalid-container-id':
        throw invalidContainerIdError
    }
  }
  return await containerService.updateContainer(
    update,
    validationResult.result.id,
    validationResult.result.request,
    log,
  )
}

export async function findContainerById(
  find: (id: string) => Promise<Container | undefined>,
  validateContainerId: ValidateContainerId,
  id: string | undefined,
  log: log,
): Promise<Container> {
  const idResult = validateContainerId(id)
  if (idResult.errorCode === 'invalid-container-id') {
    throw invalidContainerIdError
  }
  return await containerService.findContainerById(find, idResult.result, log)
}

export async function listContainers(
  list: () => Promise<Container[]>,
  log: log,
): Promise<Container[]> {
  return await containerService.listContainers(list, log)
}
