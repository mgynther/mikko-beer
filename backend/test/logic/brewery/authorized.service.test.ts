import { describe, it } from 'node:test'

import * as breweryService from '../../../src/logic/brewery/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  Brewery,
  CreateBreweryRequest,
} from '../../../src/logic/brewery/brewery.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import {
  invalidBreweryError,
  noRightsError,
} from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildBrewery,
  buildCreateBreweryRequest,
  buildUpdateBreweryRequest,
} from './builders.js'

const validCreateBreweryRequest = buildCreateBreweryRequest()

const validUpdateBreweryRequest = buildUpdateBreweryRequest()

const brewery = buildBrewery()

const invalidBreweryRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (brewery: CreateBreweryRequest) => Promise<Brewery> = async () =>
  brewery
const update: (brewery: Brewery) => Promise<Brewery> = async () => brewery

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

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
    const request = buildCreateBreweryRequest({ country: 'FI' })
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
        () => ({ errorCode: undefined, result: { name: 'Kosk' } }),
        {
          authTokenPayload: token,
          body: { name: 'Kosk' },
        },
        log,
      )
      assertDeepEqual(result, [brewery])
    })
  })
})
