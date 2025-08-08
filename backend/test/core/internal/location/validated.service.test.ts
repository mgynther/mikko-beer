import { describe, it } from 'node:test'

import * as locationService from '../../../../src/core/internal/location/validated.service'

import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../../../src/core/location/location'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidLocationError,
  invalidLocationIdError
} from '../../../../src/core/errors'

const validCreateLocationRequest: CreateLocationRequest = {
  name: 'Kuja Beer Shop & Bar'
}

const validUpdateLocationRequest: UpdateLocationRequest = {
  name: 'Kuja Beer Shop & Bar',
}

const location: Location = {
  id: '8348dbfa-c68b-4c00-8593-f2be2be3002c',
  name: validCreateLocationRequest.name
}

const invalidLocationRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (
  location: CreateLocationRequest
) => Promise<Location> = async () => location
const update: (location: Location) => Promise<Location> = async () => location

describe('location validated service unit tests', () => {
  it('create location', async () => {
    await locationService.createLocation(create, validCreateLocationRequest, log)
  })

  it('fail to create invalid location', async () => {
    await expectReject(async () => {
      await locationService.createLocation(create, invalidLocationRequest, log)
    }, invalidLocationError)
  })

  it('update location', async () => {
    await locationService.updateLocation(
      update,
      location.id,
      validUpdateLocationRequest,
      log
    )
  })

  it('fail to update invalid location', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(
        update,
        location.id,
        invalidLocationRequest,
        log
      )
    }, invalidLocationError)
  })

  it('fail to update location with undefined id', async () => {
    await expectReject(async () => {
      await locationService.updateLocation(
        update,
        undefined,
        validUpdateLocationRequest,
        log
      )
    }, invalidLocationIdError)
  })

})
