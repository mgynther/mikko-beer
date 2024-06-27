import * as containerRepository from '../../data/container/container.repository'
import * as containerService from '../../core/container/container.service'
import * as authHelper from '../authentication/authentication-helper'

import { type Router } from '../router'
import {
  type Container,
  type CreateContainerRequest,
  type NewContainer,
  type UpdateContainerRequest,
  validateCreateContainerRequest,
  validateUpdateContainerRequest
} from '../../core/container/container'
import { ControllerError } from '../../core/errors'

export function containerController (router: Router): void {
  router.post('/api/v1/container',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createContainerRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await containerService.createContainer(
          (container: NewContainer) => containerRepository.insertContainer(trx, container),
          createContainerRequest, ctx.log)
      })

      ctx.status = 201
      ctx.body = {
        container: result
      }
    }
  )

  router.put('/api/v1/container/:containerId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { containerId } = ctx.params

      const updateContainerRequest = validateUpdateRequest(body, containerId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await containerService.updateContainer(
          (container: Container) =>
            containerRepository.updateContainer(trx, container),
            containerId, updateContainerRequest, ctx.log)
      })

      ctx.status = 200
      ctx.body = {
        container: result
      }
    }
  )

  router.get(
    '/api/v1/container/:containerId',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { containerId } = ctx.params
      const container = await containerService.findContainerById((containerId: string) => {
        return containerRepository.findContainerById(ctx.db, containerId)
      }, containerId, ctx.log)

      if (container === undefined) {
        throw new ControllerError(
          404,
          'ContainerNotFound',
          `container with id ${containerId} was not found`
        )
      }

      ctx.body = { container }
    }
  )

  router.get(
    '/api/v1/container',
    authHelper.authenticateViewer,
    async (ctx) => {
      const containers = await containerService.listContainers(() => {
        return containerRepository.listContainers(ctx.db)
      }, ctx.log)
      ctx.body = { containers }
    }
  )
}

function validateCreateRequest (body: unknown): CreateContainerRequest {
  if (!validateCreateContainerRequest(body)) {
    throw new ControllerError(400, 'InvalidContainer', 'invalid container')
  }

  const result = body as CreateContainerRequest
  return result
}

function validateUpdateRequest (
  body: unknown,
  containerId: string
): UpdateContainerRequest {
  if (!validateUpdateContainerRequest(body)) {
    throw new ControllerError(400, 'InvalidContainer', 'invalid container')
  }
  if (containerId === undefined ||
      containerId === null ||
      containerId.length === 0
  ) {
    throw new ControllerError(400, 'InvalidContainerId', 'invalid container id')
  }

  const result = body as UpdateContainerRequest
  return result
}
