import * as containerService from '../../../src/core/container/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Container,
  CreateContainerRequest,
  NewContainer,
  UpdateContainerRequest
} from '../../../src/core/container/container'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  ControllerError,
  invalidContainerError,
  invalidContainerIdError,
  noRightsError
} from '../../../src/core/errors'

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
  container: NewContainer
) => Promise<Container> = async () => container
const update: (
  container: Container
) => Promise<Container> = async () => container

const adminAuthToken: AuthTokenPayload = {
  userId: '75c72a6f-95a0-475d-9b50-e926fe59ebc4',
  role: Role.admin,
  refreshTokenId: '38d569af-3996-4b6f-9632-5748481cc605'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '8460921e-08b1-4ab5-83d2-7fdde2b106fb',
  role: Role.viewer,
  refreshTokenId: 'e820508c-1c47-4676-8812-0ee2ec94c20e'
}

interface CreateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  error: ControllerError
  title: string
}

const createRejectionTests: CreateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validCreateContainerRequest,
    error: noRightsError,
    title: 'fail to create container as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidContainerRequest,
    error: noRightsError,
    title: 'fail to create invalid container as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidContainerRequest,
    error: invalidContainerError,
    title: 'fail to create invalid container as admin'
  }
]

interface UpdateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  containerId: string | undefined
  error: ControllerError
  title: string
}

const updateRejectionTests: UpdateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validUpdateContainerRequest,
    containerId: container.id,
    error: noRightsError,
    title: 'fail to update container as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidContainerRequest,
    containerId: container.id,
    error: noRightsError,
    title: 'fail to update invalid container as viewer'
  },
  {
    token: viewerAuthToken,
    body: validUpdateContainerRequest,
    containerId: undefined,
    error: noRightsError,
    title: 'fail to update container with undefined id as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidContainerRequest,
    containerId: container.id,
    error: invalidContainerError,
    title: 'fail to update invalid container as admin'
  },
  {
    token: adminAuthToken,
    body: validUpdateContainerRequest,
    containerId: undefined,
    error: invalidContainerIdError,
    title: 'fail to update container with undefined id as admin'
  },
]

describe('container authorized service unit tests', () => {
  it('create container as admin', async () => {
    await containerService.createContainer(create, {
      authTokenPayload: adminAuthToken,
      body: validCreateContainerRequest
    }, log)
  })

  createRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await containerService.createContainer(create, {
          authTokenPayload: testCase.token,
          body: testCase.body
        }, log)
      }, testCase.error)
    })
  })

  it('update container as admin', async () => {
    await containerService.updateContainer(update, {
      authTokenPayload: adminAuthToken,
      id: container.id
    }, validUpdateContainerRequest, log)
  })

  updateRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await containerService.updateContainer(update, {
          authTokenPayload: testCase.token,
          id: testCase.containerId
        }, testCase.body, log)
      }, testCase.error)
    })
  })
})
