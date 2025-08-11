import { describe, it } from 'node:test'

import * as locationService from '../../../src/core/location/authorized.service'

import type { AuthTokenPayload } from '../../../src/core/auth/auth-token'
import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../../src/core/location/location'
import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'
import {
  invalidLocationError,
  noRightsError
} from '../../../src/core/errors'
import { assertDeepEqual } from '../../assert'

const validCreateLocationRequest: CreateLocationRequest = {
  name: 'Kuja Beer Shop & Bar'
}

const validUpdateLocationRequest: UpdateLocationRequest = {
  name: 'Kuja Beer Shop & Bar',
}

const location: Location = {
  id: '581f2104-ae08-4d94-ae67-f7a3f6c4d4f3',
  name: validCreateLocationRequest.name
}

const invalidLocationRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (
  location: CreateLocationRequest
) => Promise<Location> = async () => location
const update: (location: Location) => Promise<Location> = async () => location

const adminAuthToken: AuthTokenPayload = {
  userId: '57b37a59-da27-4290-bd78-634b6c64722e',
  role: 'admin',
  refreshTokenId: '8400cecf-24a5-4e27-b6d2-42e6af054440'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '7c02b999-0c7d-4c8b-b4f1-2e3902a9a83f',
  role: 'viewer',
  refreshTokenId: '3b242dfc-9632-46bc-9985-912d5702a236'
}

describe('location authorized service unit tests', () => {
  it('create location as admin', async () => {
    await locationService.createLocation(create, {
      authTokenPayload: adminAuthToken,
      body: validCreateLocationRequest
    }, log)
  })

  it('fail to create location as viewer', async () => {
    await expectReject(async () => {
      await locationService.createLocation(create, {
        authTokenPayload: viewerAuthToken,
        body: validCreateLocationRequest
      }, log)
    }, noRightsError)
  })

  it('fail to create invalid location as admin', async () => {
    await expectReject(async () => {
      await locationService.createLocation(create, {
        authTokenPayload: adminAuthToken,
        body: invalidLocationRequest
      }, log)
    }, invalidLocationError)
  })

  it('update location as admin', async () => {
    await locationService.updateLocation(update, location.id, {
      authTokenPayload: adminAuthToken,
      body: validUpdateLocationRequest
    }, log)
  })

  it('fail to update location as viewer', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(update, location.id, {
        authTokenPayload: viewerAuthToken,
        body: validUpdateLocationRequest
      }, log)
    }, noRightsError)
  })

  it('fail to update invalid location as admin', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(update, location.id, {
        authTokenPayload: adminAuthToken,
        body: invalidLocationRequest
      }, log)
    }, invalidLocationError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find location as ${token.role}`, async () => {
      const result = await locationService.findLocationById(
        async () => location,
        {
          authTokenPayload: token,
          id: location.id
        },
        log
      )
      assertDeepEqual(result, location)
    })

    it(`list breweries as ${token.role}`, async () => {
      const result = await locationService.listLocations(
        async () => [location],
        {
          authTokenPayload: token,
          pagination: { skip: 0, size: 10 }
        },
        log
      )
      assertDeepEqual(result, [location])
    })

    it(`searches breweries as ${token.role}`, async () => {
      const result = await locationService.searchLocations(
        async () => [location],
        {
          authTokenPayload: token,
          body: { name: location.name }
        },
        log
      )
      assertDeepEqual(result, [location])
    })
  })
})
