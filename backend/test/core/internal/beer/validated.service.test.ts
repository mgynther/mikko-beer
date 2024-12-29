import * as beerService from '../../../../src/core/internal/beer/validated.service'

import type {
  Beer,
  CreateBeerRequest,
  CreateIf,
  UpdateBeerRequest,
  UpdateIf
} from '../../../../src/core/beer/beer'
import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'
import {
  invalidBeerError,
  invalidBeerIdError,
} from '../../../../src/core/errors'

const breweryId = 'b1f4cffb-7dbe-4c67-a64a-1f411771ef29'
const styleId = 'a6cc685a-11e3-408f-ad75-487e821a68d0'

const validCreateBeerRequest: CreateBeerRequest = {
  name: 'Severin',
  breweries: [breweryId],
  styles: [styleId],
}

const validUpdateBeerRequest: UpdateBeerRequest = {
  name: 'Severin',
  breweries: [breweryId],
  styles: [styleId],
}

const beer: Beer = {
  id: '52bd60b0-afaf-480d-a0f5-3d3c02f06989',
  name: validCreateBeerRequest.name
}

const invalidBeerRequest = {
  name: 'This is invalid',
  breweries: [breweryId]
}

const createIf: CreateIf = {
  create: async () => beer,
  lockBreweries: async () => [breweryId],
  lockStyles: async () => [styleId],
  insertBeerBreweries: async () => {},
  insertBeerStyles: async () => {}
}

const updateIf: UpdateIf = {
  update: async () => beer,
  lockBreweries: async () => [breweryId],
  lockStyles: async () => [styleId],
  deleteBeerBreweries: async () => {},
  deleteBeerStyles: async () => {},
  insertBeerBreweries: async () => {},
  insertBeerStyles: async () => {}
}

describe('beer validated service unit tests', () => {
  it('create beer', async () => {
    await beerService.createBeer(createIf, validCreateBeerRequest , log)
  })

  it('fail to create invalid beer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(createIf, invalidBeerRequest, log)
    }, invalidBeerError)
  })

  it('update beer', async () => {
    await beerService.updateBeer(updateIf, beer.id, validUpdateBeerRequest, log)
  })

  it('fail to update invalid beer', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, beer.id, invalidBeerRequest, log)
    }, invalidBeerError)
  })

  it('fail to update beer with undefined id', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, undefined, validUpdateBeerRequest, log)
    }, invalidBeerIdError)
  })

})
