import { suite, test } from '../../../test.js'

import * as beerService from '../../../../src/logic/internal/beer/validated.service.js'

import type {
  CreateIf,
  UpdateIf,
  ValidateCreateBeer,
  ValidateUpdateBeer,
} from '../../../../src/logic/beer/beer.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import {
  invalidBeerError,
  invalidBeerIdError,
  invalidSearchError,
} from '../../../../src/logic/errors.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildBeer,
  buildBeerWithBreweriesAndStyles,
  buildCreateBeerRequest,
  buildUpdateBeerRequest,
} from '../../beer/builders.js'

const validCreateBeerRequest = buildCreateBeerRequest()

const validUpdateBeerRequest = buildUpdateBeerRequest()

const beer = buildBeer()

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

const passCreateValidation: ValidateCreateBeer = (input: unknown) => {
  assertDeepEqual(input, validCreateBeerRequest)
  return {
    errorCode: undefined,
    result: validCreateBeerRequest,
  }
}

const failCreateValidation: ValidateCreateBeer = () => {
  return {
    errorCode: 'invalid-beer',
    result: undefined,
  }
}

const passUpdateValidation: ValidateUpdateBeer = (
  input: unknown,
  id: string | undefined,
) => {
  assertDeepEqual(input, validUpdateBeerRequest)
  assertEqual(id, beer.id)
  return {
    errorCode: undefined,
    result: {
      id: beer.id,
      request: validUpdateBeerRequest,
    },
  }
}

const failUpdateValidationWithBeer: ValidateUpdateBeer = () => {
  return {
    errorCode: 'invalid-beer',
    result: undefined,
  }
}

const failUpdateValidationWithId: ValidateUpdateBeer = () => {
  return {
    errorCode: 'invalid-beer-id',
    result: undefined,
  }
}

suite('beer validated service unit tests', () => {
  test('create beer', async () => {
    await beerService.createBeer(
      createIf,
      passCreateValidation,
      validCreateBeerRequest,
      log,
    )
  })

  test('fail to create invalid beer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(
        createIf,
        failCreateValidation,
        invalidBeerRequest,
        log,
      )
    }, invalidBeerError)
  })

  test('update beer', async () => {
    await beerService.updateBeer(
      updateIf,
      passUpdateValidation,
      beer.id,
      validUpdateBeerRequest,
      log,
    )
  })

  test('fail to update beer with invalid beer', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(
        updateIf,
        failUpdateValidationWithBeer,
        beer.id,
        invalidBeerRequest,
        log,
      )
    }, invalidBeerError)
  })

  test('fail to update beer with undefined id', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(
        updateIf,
        failUpdateValidationWithId,
        undefined,
        validUpdateBeerRequest,
        log,
      )
    }, invalidBeerIdError)
  })

  test('find beer by id', async () => {
    const beerWithBreweriesAndStyles = buildBeerWithBreweriesAndStyles()
    const result = await beerService.findBeerById(
      async () => beerWithBreweriesAndStyles,
      () => ({ errorCode: undefined, result: beerWithBreweriesAndStyles.id }),
      beerWithBreweriesAndStyles.id,
      log,
    )
    assertDeepEqual(result, beerWithBreweriesAndStyles)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  test('fail to find beer by invalid id', async () => {
    await expectReject(async () => {
      await beerService.findBeerById(
        notCalled,
        () => ({ errorCode: 'invalid-beer-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidBeerIdError)
  })

  test('search beers', async () => {
    const beerWithBreweriesAndStyles = buildBeerWithBreweriesAndStyles()
    const result = await beerService.searchBeers(
      async () => [beerWithBreweriesAndStyles],
      () => ({ errorCode: undefined, result: { name: 'Sipe' } }),
      { name: 'Sipe' },
      log,
    )
    assertDeepEqual(result, [beerWithBreweriesAndStyles])
  })

  test('fail to search beers with invalid request', async () => {
    await expectReject(async () => {
      await beerService.searchBeers(
        notCalled,
        () => ({ errorCode: 'invalid-search', result: undefined }),
        {},
        log,
      )
    }, invalidSearchError)
  })
})
