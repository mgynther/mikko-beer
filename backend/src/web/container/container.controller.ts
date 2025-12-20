import * as containerService from '../../core/container/authorized.service'

import * as containerRepository from '../../data/container/container.repository'

import * as authHelper from '../authentication/authentication-helper'

import type { Router } from '../router'
import type {
  Container,
  CreateContainerRequest
} from '../../core/container/container'
import type { Context } from '../context'

export function containerController (router: Router): void {
  router.post('/api/v1/container',
    async (ctx: Context) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body

      const result = await ctx.db.executeReadWriteTransaction(
        async (trx) => await containerService.createContainer(
          async (
            container: CreateContainerRequest
          ) => await containerRepository.insertContainer(trx, container),
          {
            authTokenPayload,
            body
          }, ctx.log
        )
      )

      return {
        status: 201,
        body: {
          container: result
        }
      }
    }
  )

  router.put('/api/v1/container/:containerId',
    async (ctx: Context) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const containerId: string | undefined = ctx.params.containerId

      const result = await ctx.db.executeReadWriteTransaction(
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

      return {
        status: 200,
        body: {
          container: result
        }
      }
    }
  )

  router.get(
    '/api/v1/container/:containerId',
    async (ctx: Context) => {
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

      return {
        status: 200,
        body: { container }
      }
    }
  )

  router.get(
    '/api/v1/container',
    async (ctx: Context) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const containers = await containerService.listContainers(
        async () =>
          await containerRepository.listContainers(ctx.db),
        authTokenPayload,
        ctx.log
      )
      return {
        status: 200,
        body: { containers }
      }
    }
  )
}
