import { suite, test } from '../../test.js'

import * as locationService from '../../../src/logic/location/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type {
  Location,
  CreateLocationRequest,
} from '../../../src/logic/location/location.js'
import { dummyLog as log } from '../dummy-log.js'
import { expectReject } from '../controller-error-helper.js'
import {
  invalidLocationError,
  noRightsError,
} from '../../../src/logic/errors.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildCreateLocationRequest,
  buildLocation,
  buildUpdateLocationRequest,
} from './builders.js'

const validCreateLocationRequest = buildCreateLocationRequest()

const validUpdateLocationRequest = buildUpdateLocationRequest()

const location = buildLocation()

const invalidLocationRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (
  location: CreateLocationRequest,
) => Promise<Location> = async () => location
const update: (location: Location) => Promise<Location> = async () => location

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

suite('location authorized service unit tests', () => {
  test('create location as admin', async () => {
    await locationService.createLocation(
      create,
      () => ({ errorCode: undefined, result: validCreateLocationRequest }),
      {
        authTokenPayload: adminAuthToken,
        body: validCreateLocationRequest,
      },
      log,
    )
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  test('fail to create location as viewer', async () => {
    await expectReject(async () => {
      await locationService.createLocation(
        create,
        notCalled,
        {
          authTokenPayload: viewerAuthToken,
          body: validCreateLocationRequest,
        },
        log,
      )
    }, noRightsError)
  })

  test('fail to create invalid location as admin', async () => {
    await expectReject(async () => {
      await locationService.createLocation(
        create,
        () => ({ errorCode: 'invalid-location', result: undefined }),
        {
          authTokenPayload: adminAuthToken,
          body: invalidLocationRequest,
        },
        log,
      )
    }, invalidLocationError)
  })

  test('update location as admin', async () => {
    await locationService.updateLocation(
      update,
      () => ({
        errorCode: undefined,
        result: { id: location.id, request: validUpdateLocationRequest },
      }),
      location.id,
      {
        authTokenPayload: adminAuthToken,
        body: validUpdateLocationRequest,
      },
      log,
    )
  })

  test('fail to update location as viewer', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(
        update,
        notCalled,
        location.id,
        {
          authTokenPayload: viewerAuthToken,
          body: validUpdateLocationRequest,
        },
        log,
      )
    }, noRightsError)
  })

  test('fail to update invalid location as admin', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(
        update,
        () => ({ errorCode: 'invalid-location', result: undefined }),
        location.id,
        {
          authTokenPayload: adminAuthToken,
          body: invalidLocationRequest,
        },
        log,
      )
    }, invalidLocationError)
  })
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    test(`find location as ${token.role}`, async () => {
      const result = await locationService.findLocationById(
        async () => location,
        () => ({ errorCode: undefined, result: location.id }),
        {
          authTokenPayload: token,
          id: location.id,
        },
        log,
      )
      assertDeepEqual(result, location)
    })

    test(`list breweries as ${token.role}`, async () => {
      const result = await locationService.listLocations(
        async () => [location],
        {
          authTokenPayload: token,
          pagination: { skip: 0, size: 10 },
        },
        log,
      )
      assertDeepEqual(result, [location])
    })

    test(`searches breweries as ${token.role}`, async () => {
      const result = await locationService.searchLocations(
        async () => [location],
        () => ({ errorCode: undefined, result: { name: 'Kuj' } }),
        {
          authTokenPayload: token,
          body: { name: 'Kuj' },
        },
        log,
      )
      assertDeepEqual(result, [location])
    })
  })
})
