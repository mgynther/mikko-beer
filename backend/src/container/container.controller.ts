import * as containerService from './container.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'
import {
  type CreateContainerRequest,
  type UpdateContainerRequest,
  validateCreateContainerRequest,
  validateUpdateContainerRequest
} from './container'
import { ControllerError } from '../util/errors'

export function containerController (router: Router): void {
  router.post('/api/v1/container',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createContainerRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await containerService.createContainer(
          trx, createContainerRequest)
      })

      ctx.status = 201
      ctx.body = {
        container: result
      }
    }
  )

  router.put('/api/v1/container/:containerId',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { containerId } = ctx.params

      const updateContainerRequest = validateUpdateRequest(body, containerId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await containerService.updateContainer(
          trx, containerId, updateContainerRequest)
      })

      ctx.status = 200
      ctx.body = {
        container: result
      }
    }
  )

  router.get(
    '/api/v1/container/:containerId',
    authService.authenticateViewer,
    async (ctx) => {
      const { containerId } = ctx.params
      const container = await containerService.findContainerById(
        ctx.db, containerId)

      if (container == null) {
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
    authService.authenticateViewer,
    async (ctx) => {
      const containers = await containerService.listContainers(ctx.db)
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
