import { describe, it } from 'node:test'

import * as beerService from '../../../../src/logic/internal/beer/validated.service.js'

import type {
  Beer,
  CreateBeerRequest,
  CreateIf,
  UpdateBeerRequest,
  UpdateIf,
  BeerWithBreweriesAndStyles,
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

const breweryId = 'b1f4cffb-7dbe-4c67-a64a-1f411771ef29'
const styleId = 'a6cc685a-11e3-408f-ad75-487e821a68d0'

const validCreateBeerRequest: CreateBeerRequest = {
  name: 'Severin',
  breweries: [breweryId],
  styles: [styleId],
}

const validUpdateBeerRequest: UpdateBeerRequest = {
  name: '94 Minutes',
  breweries: [breweryId],
  styles: [styleId],
}

const beer: Beer = {
  id: '52bd60b0-afaf-480d-a0f5-3d3c02f06989',
  name: validCreateBeerRequest.name,
}

const invalidBeerRequest = {
  name: 'This is invalid',
  breweries: [breweryId],
}

const createIf: CreateIf = {
  create: async () => beer,
  lockBreweries: async () => [breweryId],
  lockStyles: async () => [styleId],
  insertBeerBreweries: async () => {},
  insertBeerStyles: async () => {},
}

const updateIf: UpdateIf = {
  update: async () => beer,
  lockBreweries: async () => [breweryId],
  lockStyles: async () => [styleId],
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

describe('beer validated service unit tests', () => {
  it('create beer', async () => {
    await beerService.createBeer(
      createIf,
      passCreateValidation,
      validCreateBeerRequest,
      log,
    )
  })

  it('fail to create invalid beer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(
        createIf,
        failCreateValidation,
        invalidBeerRequest,
        log,
      )
    }, invalidBeerError)
  })

  it('update beer', async () => {
    await beerService.updateBeer(
      updateIf,
      passUpdateValidation,
      beer.id,
      validUpdateBeerRequest,
      log,
    )
  })

  it('fail to update beer with invalid beer', async () => {
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

  it('fail to update beer with undefined id', async () => {
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

  it('find beer by id', async () => {
    const beerWithBreweriesAndStyles: BeerWithBreweriesAndStyles = {
      ...beer,
      breweries: [{ id: breweryId, name: 'Koskipanimo' }],
      styles: [{ id: styleId, name: 'American IPA' }],
    }
    const result = await beerService.findBeerById(
      async () => beerWithBreweriesAndStyles,
      () => ({ errorCode: undefined, result: beer.id }),
      beer.id,
      log,
    )
    assertDeepEqual(result, beerWithBreweriesAndStyles)
  })

  function notCalled(): any {
    throw new Error('not to be called')
  }

  it('fail to find beer by invalid id', async () => {
    await expectReject(async () => {
      await beerService.findBeerById(
        notCalled,
        () => ({ errorCode: 'invalid-beer-id', result: undefined }),
        undefined,
        log,
      )
    }, invalidBeerIdError)
  })

  it('search beers', async () => {
    const beerWithBreweriesAndStyles: BeerWithBreweriesAndStyles = {
      ...beer,
      breweries: [{ id: breweryId, name: 'Koskipanimo' }],
      styles: [{ id: styleId, name: 'American IPA' }],
    }
    const result = await beerService.searchBeers(
      async () => [beerWithBreweriesAndStyles],
      () => ({ errorCode: undefined, result: { name: beer.name } }),
      { name: beer.name },
      log,
    )
    assertDeepEqual(result, [beerWithBreweriesAndStyles])
  })

  it('fail to search beers with invalid request', async () => {
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
