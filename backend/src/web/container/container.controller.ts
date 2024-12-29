import * as containerRepository from '../../data/container/container.repository'
import * as containerService from '../../core/container/authorized.service'
import * as authHelper from '../authentication/authentication-helper'

import type { Router } from '../router'
import type { Container, NewContainer } from '../../core/container/container'

export function containerController (router: Router): void {
  router.post('/api/v1/container',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const result = await ctx.db.executeTransaction(
        async (trx) => await containerService.createContainer(
          async (
            container: NewContainer
          ) => await containerRepository.insertContainer(trx, container),
          {
            authTokenPayload,
            body
          }, ctx.log
        )
      )

      ctx.status = 201
      ctx.body = {
        container: result
      }
    }
  )

  router.put('/api/v1/container/:containerId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request
      const containerId: string | undefined = ctx.params.containerId

      const result = await ctx.db.executeTransaction(
        async (trx) => await containerService.updateContainer(
          async (container: Container) =>
            await containerRepository.updateContainer(trx, container),
          {
            authTokenPayload,
            id: containerId
          },
          body,
          ctx.log
        )
      )

      ctx.status = 200
      ctx.body = {
        container: result
      }
    }
  )

  router.get(
    '/api/v1/container/:containerId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const containerId: string | undefined = ctx.params.containerId
      const container = await containerService.findContainerById(
        async (containerId: string) =>
          await containerRepository.findContainerById(ctx.db, containerId),
        {
          authTokenPayload,
          id: containerId
        },
        ctx.log
      )

      ctx.body = { container }
    }
  )

  router.get(
    '/api/v1/container',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const containers = await containerService.listContainers(
        async () =>
          await containerRepository.listContainers(ctx.db),
        authTokenPayload,
        ctx.log
      )
      ctx.body = { containers }
    }
  )
}
