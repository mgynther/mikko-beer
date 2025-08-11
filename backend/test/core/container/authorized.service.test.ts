import { describe, it } from 'node:test'

import * as containerService from '../../../src/core/container/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Container,
  CreateContainerRequest,
  UpdateContainerRequest
} from '../../../src/core/container/container'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidContainerError,
  noRightsError
} from '../../../src/core/errors'
import { assertDeepEqual } from '../../assert'

const validCreateContainerRequest: CreateContainerRequest = {
  size: '0.33',
  type: 'bottle'
}

const validUpdateContainerRequest: UpdateContainerRequest = {
  size: '0.44',
  type: 'can'
}

const container: Container = {
  id: '101c3ae9-80db-4d22-ba33-1f7b50f8cf49',
  size: validCreateContainerRequest.size,
  type: validCreateContainerRequest.type
}

const invalidContainerRequest = {
  size: '0.44'
}

const create: (
  container: CreateContainerRequest
) => Promise<Container> = async () => container
const update: (
  container: Container
) => Promise<Container> = async () => container

const adminAuthToken: AuthTokenPayload = {
  userId: '75c72a6f-95a0-475d-9b50-e926fe59ebc4',
  role: 'admin',
  refreshTokenId: '38d569af-3996-4b6f-9632-5748481cc605'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '8460921e-08b1-4ab5-83d2-7fdde2b106fb',
  role: 'viewer',
  refreshTokenId: 'e820508c-1c47-4676-8812-0ee2ec94c20e'
}

describe('container authorized service unit tests', () => {
  it('create container as admin', async () => {
    await containerService.createContainer(create, {
      authTokenPayload: adminAuthToken,
      body: validCreateContainerRequest
    }, log)
  })

  it('fail to create container as viewer', async () => {
    await expectReject(async () => {
      await containerService.createContainer(create, {
        authTokenPayload: viewerAuthToken,
        body: validCreateContainerRequest
      }, log)
    }, noRightsError)
  })

  it('fail to create invalid container as admin', async () => {
    await expectReject(async () => {
      await containerService.createContainer(create, {
        authTokenPayload: adminAuthToken,
        body: invalidContainerRequest
      }, log)
    }, invalidContainerError)
  })

  it('update container as admin', async () => {
    await containerService.updateContainer(update, {
      authTokenPayload: adminAuthToken,
      id: container.id
    }, validUpdateContainerRequest, log)
  })

  it('fail to update container as viewer', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(update, {
        authTokenPayload: viewerAuthToken,
        id: container.id
      }, validUpdateContainerRequest, log)
    }, noRightsError)
  })

  it('fail to update invalid container as admin', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(update, {
        authTokenPayload: adminAuthToken,
        id: container.id
      }, invalidContainerRequest, log)
    }, invalidContainerError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find container as ${token.role}`, async () => {
      const result = await containerService.findContainerById(
        async () => container,
        {
          authTokenPayload: token,
          id: container.id
        },
        log
      )
      assertDeepEqual(result, container)
    })

    it(`list containers as ${token.role}`, async () => {
      const result = await containerService.listContainers(
        async () => [container],
        token,
        log
      )
      assertDeepEqual(result, [container])
    })
  })

})
