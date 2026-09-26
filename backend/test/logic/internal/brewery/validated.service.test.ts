import { describe, it } from 'node:test'

import * as breweryService from '../../../../src/logic/internal/brewery/validated.service.js'

import type {
  Brewery,
  CreateBreweryRequest,
  ValidateCreateBrewery,
  ValidateUpdateBrewery,
} from '../../../../src/logic/brewery/brewery.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidBreweryError,
  invalidBreweryIdError,
  invalidSearchError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildBrewery,
  buildCreateBreweryRequest,
  buildUpdateBreweryRequest,
} from '../../brewery/builders.js'

const validCreateBreweryRequest = buildCreateBreweryRequest()

const validUpdateBreweryRequest = buildUpdateBreweryRequest()

const brewery = buildBrewery()

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

  it('create brewery with country', async () => {
    const request = buildCreateBreweryRequest({ country: 'FI' })
    const createWithCountry: (
      brewery: CreateBreweryRequest,
    ) => Promise<Brewery> = async (newBrewery: CreateBreweryRequest) => {
      assertDeepEqual(newBrewery, request)
      return { ...brewery, country: 'FI' }
    }
    const result = await breweryService.createBrewery(
      createWithCountry,
      () => ({ errorCode: undefined, result: request }),
      request,
      log,
    )
    assertDeepEqual(result, { ...brewery, country: 'FI' })
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
    const found = buildBrewery()
    const result = await breweryService.findBreweryById(
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

  it('search breweries', async () => {
    const result = await breweryService.searchBreweries(
      async () => [brewery],
      () => ({ errorCode: undefined, result: { name: 'Kosk' } }),
      { name: 'Kosk' },
      log,
    )
    assertDeepEqual(result, [brewery])
  })

  it('fail to search breweries with invalid request', async () => {
    await expectReject(async () => {
      await breweryService.searchBreweries(
        notCalled,
        () => ({ errorCode: 'invalid-search', result: undefined }),
        {},
        log,
      )
    }, invalidSearchError)
  })
})
