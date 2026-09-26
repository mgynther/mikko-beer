import { suite, test } from '../../test.js'

import * as containerService from '../../../src/logic/container/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  Container,
  CreateContainerRequest,
} from '../../../src/logic/container/container.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import {
  invalidContainerError,
  noRightsError,
} from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildContainer,
  buildCreateContainerRequest,
  buildUpdateContainerRequest,
} from './builders.js'

const validCreateContainerRequest = buildCreateContainerRequest()

const validUpdateContainerRequest = buildUpdateContainerRequest()

const container = buildContainer()

const invalidContainerRequest = {
  size: '0.44',
}

const create: (
  container: CreateContainerRequest,
) => Promise<Container> = async () => container
const update: (container: Container) => Promise<Container> = async () =>
  container

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

suite('container authorized service unit tests', () => {
  test('create container as admin', async () => {
    await containerService.createContainer(
      create,
      () => ({ errorCode: undefined, result: validCreateContainerRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateContainerRequest,
      },
      log,
    )
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  test('fail to create container as viewer', async () => {
    await expectReject(async () => {
      await containerService.createContainer(
        create,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateContainerRequest,
        },
        log,
      )
    }, noRightsError)
  })

  test('fail to create invalid container as admin', async () => {
    await expectReject(async () => {
      await containerService.createContainer(
        create,
        () => ({ errorCode: 'invalid-container', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidContainerRequest,
        },
        log,
      )
    }, invalidContainerError)
  })

  test('update container as admin', async () => {
    await containerService.updateContainer(
      update,
      () => ({
        errorCode: undefined,
        result: { id: container.id, request: validUpdateContainerRequest },
      }),
      {
        authTokenPayload: adminAuthToken,
        id: container.id,
      },
      validUpdateContainerRequest,
      log,
    )
  })

  test('fail to update container as viewer', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(
        update,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          id: container.id,
        },
        validUpdateContainerRequest,
        log,
      )
    }, noRightsError)
  })

  test('fail to update invalid container as admin', async () => {
    await expectReject(async () => {
      await containerService.updateContainer(
        update,
        () => ({ errorCode: 'invalid-container', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          id: container.id,
        },
        invalidContainerRequest,
        log,
      )
    }, invalidContainerError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    test(`find container as ${token.role}`, async () => {
      const result = await containerService.findContainerById(
        async () => container,
        () => ({ errorCode: undefined, result: container.id }),
        {
          authTokenPayload: token,
          id: container.id,
        },
        log,
      )
      assertDeepEqual(result, container)
    })

    test(`list containers as ${token.role}`, async () => {
      const result = await containerService.listContainers(
        async () => [container],
        token,
        log,
      )
      assertDeepEqual(result, [container])
    })
  })
})
