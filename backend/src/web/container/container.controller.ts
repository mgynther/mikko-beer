import * as containerRepository from '../../data/container/container.repository'
import * as containerService from '../../core/container/container.service'
import * as authHelper from '../authentication/authentication-helper'

import { type Router } from '../router'
import {
  type Container,
  type NewContainer,
  validateCreateContainerRequest,
  validateUpdateContainerRequest
} from '../../core/container/container'

export function containerController (router: Router): void {
  router.post('/api/v1/container',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const createContainerRequest = validateCreateContainerRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await containerService.createContainer(
          (
            container: NewContainer
          ) => containerRepository.insertContainer(trx, container),
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

      const updateContainerRequest = validateUpdateContainerRequest(
        body,
        containerId
      )
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
