import { suite, test } from '../../../test.js'

import * as locationService from '../../../../src/logic/internal/location/validated.service.js'

import type {
  Location,
  CreateLocationRequest,
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
import {
  buildCreateLocationRequest,
  buildLocation,
  buildUpdateLocationRequest,
} from '../../location/builders.js'

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

suite('location validated service unit tests', () => {
  test('create location', async () => {
    await locationService.createLocation(
      create,
      passCreateValidation,
      validCreateLocationRequest,
      log,
    )
  })

  test('fail to create invalid location', async () => {
    await expectReject(async () => {
      await locationService.createLocation(
        create,
        failCreateValidation,
        invalidLocationRequest,
        log,
      )
    }, invalidLocationError)
  })

  test('update location', async () => {
    await locationService.updateLocation(
      update,
      passUpdateValidation,
      location.id,
      validUpdateLocationRequest,
      log,
    )
  })

  test('fail to update location with invalid location', async () => {
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

  test('fail to update location with undefined id', async () => {
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

  test('find location by id', async () => {
    const found = buildLocation()
    const result = await locationService.findLocationById(
      async () => found,
      () => ({ errorCode: undefined, result: found.id }),
      found.id,
      log,
    )
    assertDeepEqual(result, found)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  test('fail to find location by invalid id', async () => {
    await expectReject(async () => {
      await locationService.findLocationById(
        notCalled,
        () => ({ errorCode: 'invalid-location-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidLocationIdError)
  })

  test('search locations', async () => {
    const result = await locationService.searchLocations(
      async () => [location],
      () => ({ errorCode: undefined, result: { name: 'Kuj' } }),
      { name: 'Kuj' },
      log,
    )
    assertDeepEqual(result, [location])
  })

  test('fail to search locations with invalid request', async () => {
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
