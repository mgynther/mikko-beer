import { describe, it } from 'node:test'

import * as breweryService from '../../../../src/logic/internal/brewery/validated.service.js'

import type {
  Brewery,
  CreateBreweryRequest,
  UpdateBreweryRequest,
  ValidateCreateBrewery,
  ValidateUpdateBrewery,
} from '../../../../src/logic/brewery/brewery.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidBreweryError,
  invalidBreweryIdError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'

const validCreateBreweryRequest: CreateBreweryRequest = {
  name: 'Koskipanimo',
}

const validUpdateBreweryRequest: UpdateBreweryRequest = {
  name: 'Pyynikin käsityöläispanimo',
}

const brewery: Brewery = {
  id: 'cac161f5-2792-4fbb-a251-4305ee39f350',
  name: validCreateBreweryRequest.name,
}

const invalidBreweryRequest = {
  unexpectedProperty: 'This is invalid',
}

const create: (brewery: CreateBreweryRequest) => Promise<Brewery> = async () =>
  brewery
const update: (brewery: Brewery) => Promise<Brewery> = async () => brewery

const passCreateValidation: ValidateCreateBrewery = (input: unknown) => {
  assertDeepEqual(input, validCreateBreweryRequest)
  return {
    errorCode: undefined,
    result: validCreateBreweryRequest,
  }
}

const failCreateValidation: ValidateCreateBrewery = () => {
  return {
    errorCode: 'invalid-brewery',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateBrewery = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateBreweryRequest)
  assertEqual(id, brewery.id)
  return {
    errorCode: undefined,
    result: {
      id: brewery.id,
      request: validUpdateBreweryRequest,
    },
  }
}

const failUpdateValidationWithBrewery: ValidateUpdateBrewery = () => {
  return {
    errorCode: 'invalid-brewery',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateBrewery = () => {
  return {
    errorCode: 'invalid-brewery-id',
    result: undefined,
  }
}

describe('brewery validated service unit tests', () => {
  it('create brewery', async () => {
    await breweryService.createBrewery(
      create,
      passCreateValidation,
      validCreateBreweryRequest,
      log,
    )
  })

  it('fail to create invalid brewery', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(
        create,
        failCreateValidation,
        invalidBreweryRequest,
        log,
      )
    }, invalidBreweryError)
  })

  it('update brewery', async () => {
    await breweryService.updateBrewery(
      update,
      passUpdateValidation,
      brewery.id,
      validUpdateBreweryRequest,
      log,
    )
  })

  it('fail to update brewery with invalid brewery', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        failUpdateValidationWithBrewery,
        brewery.id,
        invalidBreweryRequest,
        log,
      )
    }, invalidBreweryError)
  })

  it('fail to update brewery with undefined id', async () => {
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        failUpdateValidationWithId,
        undefined,
        validUpdateBreweryRequest,
        log,
      )
    }, invalidBreweryIdError)
  })

  it('find brewery by id', async () => {
    const id = 'b0f6b8ba-63f8-4ba6-9b46-3fb0a1d6ee31'
    await breweryService.findBreweryById(
      async () => ({ id, name: brewery.name }),
      () => ({ errorCode: undefined, result: id }),
      id,
      log,
    )
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('fail to find brewery by invalid id', async () => {
    await expectReject(async () => {
      await breweryService.findBreweryById(
        notCalled,
        () => ({ errorCode: 'invalid-brewery-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidBreweryIdError)
  })
})
