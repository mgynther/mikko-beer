import { describe, it } from 'node:test'

import * as locationService from '../../../../src/logic/internal/location/validated.service.js'

import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  ValidateCreateLocation,
  ValidateUpdateLocation,
} from '../../../../src/logic/location/location.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidLocationError,
  invalidLocationIdError,
  invalidSearchError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'

const validCreateLocationRequest: CreateLocationRequest = {
  name: 'Kuja Beer Shop & Bar',
}

const validUpdateLocationRequest: UpdateLocationRequest = {
  name: 'Oluthuone Kaisla',
}

const location: Location = {
  id: '8348dbfa-c68b-4c00-8593-f2be2be3002c',
  name: validCreateLocationRequest.name,
}

const invalidLocationRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (
  location: CreateLocationRequest,
) => Promise<Location> = async () => location
const update: (location: Location) => Promise<Location> = async () => location

const passCreateValidation: ValidateCreateLocation = (input: unknown) => {
  assertDeepEqual(input, validCreateLocationRequest)
  return {
    errorCode: undefined,
    result: validCreateLocationRequest,
  }
}

const failCreateValidation: ValidateCreateLocation = () => {
  return {
    errorCode: 'invalid-location',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateLocation = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateLocationRequest)
  assertEqual(id, location.id)
  return {
    errorCode: undefined,
    result: {
      id: location.id,
      request: validUpdateLocationRequest,
    },
  }
}

const failUpdateValidationWithLocation: ValidateUpdateLocation = () => {
  return {
    errorCode: 'invalid-location',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateLocation = () => {
  return {
    errorCode: 'invalid-location-id',
    result: undefined,
  }
}

describe('location validated service unit tests', () => {
  it('create location', async () => {
    await locationService.createLocation(
      create,
      passCreateValidation,
      validCreateLocationRequest,
      log,
    )
  })

  it('fail to create invalid location', async () => {
    await expectReject(async () => {
      await locationService.createLocation(
        create,
        failCreateValidation,
        invalidLocationRequest,
        log,
      )
    }, invalidLocationError)
  })

  it('update location', async () => {
    await locationService.updateLocation(
      update,
      passUpdateValidation,
      location.id,
      validUpdateLocationRequest,
      log,
    )
  })

  it('fail to update location with invalid location', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(
        update,
        failUpdateValidationWithLocation,
        location.id,
        invalidLocationRequest,
        log,
      )
    }, invalidLocationError)
  })

  it('fail to update location with undefined id', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(
        update,
        failUpdateValidationWithId,
        undefined,
        validUpdateLocationRequest,
        log,
      )
    }, invalidLocationIdError)
  })

  it('find location by id', async () => {
    const id = 'd4a0a0b8-3b08-4f70-a1b6-1f0ae3a1e2f6'
    await locationService.findLocationById(
      async () => ({ id, name: location.name }),
      () => ({ errorCode: undefined, result: id }),
      id,
      log,
    )
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('fail to find location by invalid id', async () => {
    await expectReject(async () => {
      await locationService.findLocationById(
        notCalled,
        () => ({ errorCode: 'invalid-location-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidLocationIdError)
  })

  it('search locations', async () => {
    const result = await locationService.searchLocations(
      async () => [location],
      () => ({ errorCode: undefined, result: { name: location.name } }),
      { name: location.name },
      log,
    )
    assertDeepEqual(result, [location])
  })

  it('fail to search locations with invalid request', async () => {
    await expectReject(async () => {
      await locationService.searchLocations(
        notCalled,
        () => ({ errorCode: 'invalid-search', result: undefined }),
        {},
        log,
      )
    }, invalidSearchError)
  })
})
