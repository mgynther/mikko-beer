import { suite, test } from '../../test.js'

import * as beerService from '../../../src/logic/beer/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type { CreateIf, UpdateIf } from '../../../src/logic/beer/beer.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import { invalidBeerError, noRightsError } from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildBeer,
  buildBeerWithBreweriesAndStyles,
  buildCreateBeerRequest,
  buildUpdateBeerRequest,
} from './builders.js'

const validCreateBeerRequest = buildCreateBeerRequest()

const validUpdateBeerRequest = buildUpdateBeerRequest()

const beer = buildBeer()

const beerWithBreweriesAndStyles = buildBeerWithBreweriesAndStyles()

const invalidBeerRequest = {
  name: 'This is invalid',
}

// Every brewery and style a request refers to exists.
const createIf: CreateIf = {
  create: async () => beer,
  lockBreweries: async (ids: string[]) => ids,
  lockStyles: async (ids: string[]) => ids,
  insertBeerBreweries: async () => {},
  insertBeerStyles: async () => {},
}

const updateIf: UpdateIf = {
  update: async () => beer,
  lockBreweries: async (ids: string[]) => ids,
  lockStyles: async (ids: string[]) => ids,
  deleteBeerBreweries: async () => {},
  deleteBeerStyles: async () => {},
  insertBeerBreweries: async () => {},
  insertBeerStyles: async () => {},
}

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

suite('beer authorized service unit tests', () => {
  function notCalled(): any {
    throw new Error('not to be called')
  }

  test('create beer as admin', async () => {
    await beerService.createBeer(
      createIf,
      () => ({ errorCode: undefined, result: validCreateBeerRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateBeerRequest,
      },
      log,
    )
  })

  test('fail to create beer as viewer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(
        createIf,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateBeerRequest,
        },
        log,
      )
    }, noRightsError)
  })

  test('fail to create invalid beer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(
        createIf,
        () => ({ errorCode: 'invalid-beer', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidBeerRequest,
        },
        log,
      )
    }, invalidBeerError)
  })

  test('update beer as admin', async () => {
    await beerService.updateBeer(
      updateIf,
      () => ({
        errorCode: undefined,
        result: { id: beer.id, request: validUpdateBeerRequest },
      }),
      beer.id,
      {
        authTokenPayload: adminAuthToken,
        body: validUpdateBeerRequest,
      },
      log,
    )
  })

  test('fail to update beer as viewer', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(
        updateIf,
        notCalled,
        beer.id,
        {
          authTokenPayload: viewerAuthToken,
          body: validUpdateBeerRequest,
        },
        log,
      )
    }, noRightsError)
  })

  test('fail to update invalid beer as admin', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(
        updateIf,
        () => ({ errorCode: 'invalid-beer', result: undefined }),
        beer.id,
        {
          authTokenPayload: adminAuthToken,
          body: invalidBeerRequest,
        },
        log,
      )
    }, invalidBeerError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    test(`find beer as ${token.role}`, async () => {
      const result = await beerService.findBeerById(
        async () => beerWithBreweriesAndStyles,
        () => ({
          errorCode: undefined,
          result: beerWithBreweriesAndStyles.id,
        }),
        {
          authTokenPayload: token,
          id: beerWithBreweriesAndStyles.id,
        },
        log,
      )
      assertDeepEqual(result, beerWithBreweriesAndStyles)
    })

    test(`list beers as ${token.role}`, async () => {
      const result = await beerService.listBeers(
        async () => [beerWithBreweriesAndStyles],
        {
          authTokenPayload: token,
          pagination: { skip: 0, size: 10 },
        },
        log,
      )
      assertDeepEqual(result, [beerWithBreweriesAndStyles])
    })

    test(`searches beers as ${token.role}`, async () => {
      const result = await beerService.searchBeers(
        async () => [beerWithBreweriesAndStyles],
        () => ({ errorCode: undefined, result: { name: 'Sipe' } }),
        {
          authTokenPayload: token,
          body: { name: 'Sipe' },
        },
        log,
      )
      assertDeepEqual(result, [beerWithBreweriesAndStyles])
    })
  })
})
