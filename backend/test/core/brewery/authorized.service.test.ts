import * as breweryService from '../../../src/core/brewery/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Brewery,
  NewBrewery,
  UpdateBreweryRequest
} from '../../../src/core/brewery/brewery'
import { Role } from '../../../src/core/user/user'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  ControllerError,
  invalidBreweryError,
  invalidBreweryIdError,
  noRightsError
} from '../../../src/core/errors'

const validCreateBreweryRequest: NewBrewery = {
  name: 'Koskipanimo'
}

const validUpdateBreweryRequest: UpdateBreweryRequest = {
  name: 'Koskipanimo',
}

const brewery: Brewery = {
  id: '7a0c8831-af4b-4600-b527-6f3d58c3abad',
  name: validCreateBreweryRequest.name
}

const invalidBreweryRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (brewery: NewBrewery) => Promise<Brewery> = async () => brewery
const update: (brewery: Brewery) => Promise<Brewery> = async () => brewery

const adminAuthToken: AuthTokenPayload = {
  userId: 'fd64b45e-baac-4372-a4ab-9970b8282a1d',
  role: Role.admin,
  refreshTokenId: '121b797c-ae9d-4362-817e-6af5674401ae'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '73eae8cd-4ef5-42f6-b492-604b1e25dfad',
  role: Role.viewer,
  refreshTokenId: 'deda2185-2814-4943-9f81-d8880ba06ec1'
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
    body: validCreateBreweryRequest,
    error: noRightsError,
    title: 'fail to create brewery as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidBreweryRequest,
    error: noRightsError,
    title: 'fail to create invalid brewery as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidBreweryRequest,
    error: invalidBreweryError,
    title: 'fail to create invalid brewery as admin'
  }
]

interface UpdateRejectionTest {
  token: AuthTokenPayload
  body: unknown
  breweryId: string | undefined
  error: ControllerError
  title: string
}

const updateRejectionTests: UpdateRejectionTest[] = [
  {
    token: viewerAuthToken,
    body: validUpdateBreweryRequest,
    breweryId: brewery.id,
    error: noRightsError,
    title: 'fail to update brewery as viewer'
  },
  {
    token: viewerAuthToken,
    body: invalidBreweryRequest,
    breweryId: brewery.id,
    error: noRightsError,
    title: 'fail to update invalid brewery as viewer'
  },
  {
    token: viewerAuthToken,
    body: validUpdateBreweryRequest,
    breweryId: undefined,
    error: noRightsError,
    title: 'fail to update brewery with undefined id as viewer'
  },
  {
    token: adminAuthToken,
    body: invalidBreweryRequest,
    breweryId: brewery.id,
    error: invalidBreweryError,
    title: 'fail to update invalid brewery as admin'
  },
  {
    token: adminAuthToken,
    body: validUpdateBreweryRequest,
    breweryId: undefined,
    error: invalidBreweryIdError,
    title: 'fail to update brewery with undefined id as admin'
  },
]

describe('brewery authorized service unit tests', () => {
  it('create brewery as admin', async () => {
    await breweryService.createBrewery(create, {
      authTokenPayload: adminAuthToken,
      body: validCreateBreweryRequest
    }, log)
  })

  createRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await breweryService.createBrewery(create, {
          authTokenPayload: testCase.token,
          body: testCase.body
        }, log)
      }, testCase.error)
    })
  })

  it('update brewery as admin', async () => {
    await breweryService.updateBrewery(update, brewery.id, {
      authTokenPayload: adminAuthToken,
      body: validUpdateBreweryRequest
    }, log)
  })

  updateRejectionTests.forEach(testCase => {
    it(testCase.title, async () => {
      await expectReject(async () => {
        await breweryService.updateBrewery(update, testCase.breweryId, {
          authTokenPayload: testCase.token,
          body: testCase.body
        }, log)
      }, testCase.error)
    })
  })
})
