import { suite, test } from '../../../test.js'

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
  invalidPaginationError,
} from '../../../../src/logic/errors.js'
import type { Pagination } from '../../../../src/logic/pagination.js'
import { mockFunction } from '../../../mock.js'
import {
  failPaginationValidation,
  passPaginationValidation,
} from '../../pagination-validation.js'
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

suite('brewery validated service unit tests', () => {
  test('create brewery', async () => {
    await breweryService.createBrewery(
      create,
      passCreateValidation,
      validCreateBreweryRequest,
      log,
    )
  })

  test('create brewery with country', async () => {
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

  test('fail to create invalid brewery', async () => {
    await expectReject(async () => {
      await breweryService.createBrewery(
        create,
        failCreateValidation,
        invalidBreweryRequest,
        log,
      )
    }, invalidBreweryError)
  })

  test('update brewery', async () => {
    await breweryService.updateBrewery(
      update,
      passUpdateValidation,
      brewery.id,
      validUpdateBreweryRequest,
      log,
    )
  })

  test('fail to update brewery with invalid brewery', async () => {
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

  test('fail to update brewery with undefined id', async () => {
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

  test('find brewery by id', async () => {
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

  test('fail to find brewery by invalid id', async () => {
    await expectReject(async () => {
      await breweryService.findBreweryById(
        notCalled,
        () => ({ errorCode: 'invalid-brewery-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidBreweryIdError)
  })

  test('search breweries', async () => {
    const result = await breweryService.searchBreweries(
      async () => [brewery],
      () => ({ errorCode: undefined, result: { name: 'Kosk' } }),
      { name: 'Kosk' },
      log,
    )
    assertDeepEqual(result, [brewery])
  })

  test('fail to search breweries with invalid request', async () => {
    await expectReject(async () => {
      await breweryService.searchBreweries(
        notCalled,
        () => ({ errorCode: 'invalid-search', result: undefined }),
        {},
        log,
      )
    }, invalidSearchError)
  })

  test('list breweries with the pagination validated', async () => {
    const list = mockFunction<[pagination: Pagination], Promise<never[]>>(
      async () => [],
    )
    const result = await breweryService.listBreweries(
      list,
      passPaginationValidation({ size: 20, skip: 40 }),
      { size: '20', skip: '40' },
      log,
    )
    assertDeepEqual(result, {
      breweries: [],
      pagination: { size: 20, skip: 40 },
    })
    assertDeepEqual(
      list.mock.calls.map((call) => call.arguments),
      [[{ size: 20, skip: 40 }]],
    )
  })

  test('fail to list breweries with invalid pagination', async () => {
    await expectReject(async () => {
      await breweryService.listBreweries(
        async () => [],
        failPaginationValidation,
        { size: 'invalid', skip: '40' },
        log,
      )
    }, invalidPaginationError)
  })
})
