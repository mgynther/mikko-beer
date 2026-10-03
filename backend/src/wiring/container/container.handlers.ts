import * as containerService from '../../logic/container/authorized.service.js'
import type {
  Container,
  CreateContainerRequest,
} from '../../logic/container/container.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'

import * as containerRepository from '../../data/container/container.repository.js'
import type { Transaction } from '../../data/database.js'

import {
  validateContainerId,
  validateCreateContainerRequest,
  validateUpdateContainerRequest,
} from '../../validation/container.js'

import type {
  ContainerBody,
  ContainerHandlers,
  ContainerListBody,
  ReadContainerBody,
} from '../../web/container/container.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
} from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

export function createContainerHandlers(context: Context): ContainerHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<ContainerBody> => {
        const container = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Container> =>
            await containerService.createContainer(
              async (container: CreateContainerRequest): Promise<Container> =>
                await containerRepository.insertContainer(trx, container),
              validateCreateContainerRequest,
              { authTokenPayload, body: request.body },
              log,
            ),
        )
        return { container }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<ContainerBody> => {
        const container = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Container> =>
            await containerService.updateContainer(
              async (container: Container): Promise<Container | undefined> =>
                await containerRepository.updateContainer(trx, container),
              validateUpdateContainerRequest,
              { authTokenPayload, id: request.id },
              request.body,
              log,
            ),
        )
        return { container }
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadContainerBody> => {
        const container = await containerService.findContainerById(
          async (containerId: string): Promise<Container | undefined> =>
            await containerRepository.findContainerById(db, containerId),
          validateContainerId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { container }
      },
    ),

    list: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
      ): Promise<ContainerListBody> => {
        const containers = await containerService.listContainers(
          async (): Promise<Container[]> =>
            await containerRepository.listContainers(db),
          authTokenPayload,
          log,
        )
        return { containers }
      },
    ),
  }
}
