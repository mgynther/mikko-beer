import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import * as breweryService from '../../../src/core/brewery/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Brewery,
  CreateBreweryRequest,
  UpdateBreweryRequest
} from '../../../src/core/brewery/brewery'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidBreweryError,
  noRightsError
} from '../../../src/core/errors'

const validCreateBreweryRequest: CreateBreweryRequest = {
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

const create: (
  brewery: CreateBreweryRequest
) => Promise<Brewery> = async () => brewery
const update: (brewery: Brewery) => Promise<Brewery> = async () => brewery

const adminAuthToken: AuthTokenPayload = {
  userId: 'fd64b45e-baac-4372-a4ab-9970b8282a1d',
  role: 'admin',
  refreshTokenId: '121b797c-ae9d-4362-817e-6af5674401ae'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '73eae8cd-4ef5-42f6-b492-604b1e25dfad',
  role: 'viewer',
  refreshTokenId: 'deda2185-2814-4943-9f81-d8880ba06ec1'
}

describe('brewery authorized service unit tests', () => {
  it('create brewery as admin', async () => {
    await breweryService.createBrewery(create, {
      authTokenPayload: adminAuthToken,
      body: validCreateBreweryRequest
    }, log)
  })

  it('fail to create brewery as viewer', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(create, {
        authTokenPayload: viewerAuthToken,
        body: validCreateBreweryRequest
      }, log)
    }, noRightsError)
  })

  it('fail to create invalid brewery as admin', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(create, {
        authTokenPayload: adminAuthToken,
        body: invalidBreweryRequest
      }, log)
    }, invalidBreweryError)
  })

  it('update brewery as admin', async () => {
    await breweryService.updateBrewery(update, brewery.id, {
      authTokenPayload: adminAuthToken,
      body: validUpdateBreweryRequest
    }, log)
  })

  it('fail to update brewery as viewer', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(update, brewery.id, {
        authTokenPayload: viewerAuthToken,
        body: validUpdateBreweryRequest
      }, log)
    }, noRightsError)
  })

  it('fail to update invalid brewery as admin', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(update, brewery.id, {
        authTokenPayload: adminAuthToken,
        body: invalidBreweryRequest
      }, log)
    }, invalidBreweryError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find brewery as ${token.role}`, async () => {
      const result = await breweryService.findBreweryById(
        async () => brewery,
        {
          authTokenPayload: token,
          id: brewery.id
        },
        log
      )
      assert.deepEqual(result, brewery)
    })

    it(`list breweries as ${token.role}`, async () => {
      const result = await breweryService.listBreweries(
        async () => [brewery],
        {
          authTokenPayload: token,
          pagination: { skip: 0, size: 10 }
        },
        log
      )
      assert.deepEqual(result, [brewery])
    })

    it(`searches breweries as ${token.role}`, async () => {
      const result = await breweryService.searchBreweries(
        async () => [brewery],
        {
          authTokenPayload: token,
          body: { name: brewery.name }
        },
        log
      )
      assert.deepEqual(result, [brewery])
    })
  })
})
