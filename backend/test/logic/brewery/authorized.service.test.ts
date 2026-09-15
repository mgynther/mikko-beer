import { describe, it } from 'node:test'

import * as breweryService from '../../../src/logic/brewery/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  Brewery,
  CreateBreweryRequest,
  UpdateBreweryRequest,
} from '../../../src/logic/brewery/brewery.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import {
  invalidBreweryError,
  noRightsError,
} from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'

const validCreateBreweryRequest: CreateBreweryRequest = {
  name: 'Koskipanimo',
  country: undefined,
}

const validUpdateBreweryRequest: UpdateBreweryRequest = {
  name: 'Koskipanimo',
  country: undefined,
}

const brewery: Brewery = {
  id: '7a0c8831-af4b-4600-b527-6f3d58c3abad',
  name: validCreateBreweryRequest.name,
  country: undefined,
}

const invalidBreweryRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (brewery: CreateBreweryRequest) => Promise<Brewery> = async () =>
  brewery
const update: (brewery: Brewery) => Promise<Brewery> = async () => brewery

const adminAuthToken: AuthTokenPayload = {
  userId: 'fd64b45e-baac-4372-a4ab-9970b8282a1d',
  role: 'admin',
  refreshTokenId: '121b797c-ae9d-4362-817e-6af5674401ae',
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '73eae8cd-4ef5-42f6-b492-604b1e25dfad',
  role: 'viewer',
  refreshTokenId: 'deda2185-2814-4943-9f81-d8880ba06ec1',
}

describe('brewery authorized service unit tests', () => {
  it('create brewery as admin', async () => {
    await breweryService.createBrewery(
      create,
      () => ({ errorCode: undefined, result: validCreateBreweryRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateBreweryRequest,
      },
      log,
    )
  })

  it('create brewery with country as admin', async () => {
    const request: CreateBreweryRequest = {
      name: validCreateBreweryRequest.name,
      country: 'FI',
    }
    const result = await breweryService.createBrewery(
      async (newBrewery: CreateBreweryRequest) => {
        assertDeepEqual(newBrewery, request)
        return { ...brewery, country: 'FI' }
      },
      () => ({ errorCode: undefined, result: request }),
      {
        authTokenPayload: adminAuthToken,
        body: request,
      },
      log,
    )
    assertDeepEqual(result, { ...brewery, country: 'FI' })
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('fail to create brewery as viewer', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(
        create,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateBreweryRequest,
        },
        log,
      )
    }, noRightsError)
  })

  it('fail to create invalid brewery as admin', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(
        create,
        () => ({ errorCode: 'invalid-brewery', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidBreweryRequest,
        },
        log,
      )
    }, invalidBreweryError)
  })

  it('update brewery as admin', async () => {
    await breweryService.updateBrewery(
      update,
      () => ({
        errorCode: undefined,
        result: { id: brewery.id, request: validUpdateBreweryRequest },
      }),
      brewery.id,
      {
        authTokenPayload: adminAuthToken,
        body: validUpdateBreweryRequest,
      },
      log,
    )
  })

  it('fail to update brewery as viewer', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        notCalled,
        brewery.id,
        {
          authTokenPayload: viewerAuthToken,
          body: validUpdateBreweryRequest,
        },
        log,
      )
    }, noRightsError)
  })

  it('fail to update invalid brewery as admin', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        () => ({ errorCode: 'invalid-brewery', result: undefined }),
        brewery.id,
        {
          authTokenPayload: adminAuthToken,
          body: invalidBreweryRequest,
        },
        log,
      )
    }, invalidBreweryError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find brewery as ${token.role}`, async () => {
      const result = await breweryService.findBreweryById(
        async () => brewery,
        () => ({ errorCode: undefined, result: brewery.id }),
        {
          authTokenPayload: token,
          id: brewery.id,
        },
        log,
      )
      assertDeepEqual(result, brewery)
    })

    it(`list breweries as ${token.role}`, async () => {
      const result = await breweryService.listBreweries(
        async () => [brewery],
        {
          authTokenPayload: token,
          pagination: { skip: 0, size: 10 },
        },
        log,
      )
      assertDeepEqual(result, [brewery])
    })

    it(`searches breweries as ${token.role}`, async () => {
      const result = await breweryService.searchBreweries(
        async () => [brewery],
        () => ({ errorCode: undefined, result: { name: brewery.name } }),
        {
          authTokenPayload: token,
          body: { name: brewery.name },
        },
        log,
      )
      assertDeepEqual(result, [brewery])
    })
  })
})
