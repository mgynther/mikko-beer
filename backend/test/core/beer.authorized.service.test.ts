import { expect } from 'earl'

import * as beerService from '../../src/core/beer.authorized.service'

import type { AuthTokenPayload } from '../../src/core/auth/auth-token'
import type {
  Beer,
  BeerWithBreweriesAndStyles,
  CreateBeerRequest,
  CreateIf,
  UpdateBeerRequest,
  UpdateIf
} from '../../src/core/beer'
import { Role } from '../../src/core/user/user'
import { dummyLog as log } from './dummy-log'
import { expectReject } from './controller-error-helper'
import {
  invalidBeerError,
  noRightsError
} from '../../src/core/errors'

const breweryId = '25eb0361-ed50-4de7-aec5-74fe4e7fe011'
const styleId = '0716f9c8-a419-4c36-af3d-425ed1a3a306'

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
  id: '149bfae4-a2e6-45b9-a397-e61d3fa7a1c3',
  name: validCreateBeerRequest.name
}

const beerWithBreweriesAndStyles: BeerWithBreweriesAndStyles = {
  ...beer,
  breweries: [],
  styles: []
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

const adminAuthToken: AuthTokenPayload = {
  userId: '5b5590e3-3bef-4267-a0f8-fe051fb681a5',
  role: Role.admin,
  refreshTokenId: 'd7206329-8ccd-4509-bb5c-61d74798cda8'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '6018c984-4e6c-4d17-b814-7511eff902d4',
  role: Role.viewer,
  refreshTokenId: 'db81d9d8-d11e-40f2-83cf-4cddc98504c7'
}

describe('beer authorized service unit tests', () => {
  it('create beer as admin', async () => {
    await beerService.createBeer(createIf, {
      authTokenPayload: adminAuthToken,
      body: validCreateBeerRequest
    }, log)
  })

  it('fail to create beer as viewer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(createIf, {
        authTokenPayload: viewerAuthToken,
        body: validCreateBeerRequest
      }, log)
    }, noRightsError)
  })

  it('fail to create invalid beer', async () => {
    await expectReject(async () => {
      await beerService.createBeer(createIf, {
        authTokenPayload: adminAuthToken,
        body: invalidBeerRequest
      }, log)
    }, invalidBeerError)
  })

  it('update beer as admin', async () => {
    await beerService.updateBeer(updateIf, beer.id, {
      authTokenPayload: adminAuthToken,
      body: validUpdateBeerRequest
    }, log)
  })

  it('fail to update beer as viewer', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, beer.id, {
        authTokenPayload: viewerAuthToken,
        body: validUpdateBeerRequest
      }, log)
    }, noRightsError)
  })

  it('fail to update invalid beer as admin', async () => {
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, beer.id, {
        authTokenPayload: adminAuthToken,
        body: invalidBeerRequest
      }, log)
    }, invalidBeerError)
  })
  ;

  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    it(`find beer as ${token.role}`, async () => {
      const result = await beerService.findBeerById(
        async () => beerWithBreweriesAndStyles,
        {
          authTokenPayload: token,
          id: beer.id
        },
        log
      )
      expect(result).toEqual(beerWithBreweriesAndStyles)
    })

    it(`list beers as ${token.role}`, async () => {
      const result = await beerService.listBeers(
        async () => [beerWithBreweriesAndStyles],
        {
          authTokenPayload: token,
          pagination: { skip: 0, size: 10 }
        },
        log
      )
      expect(result).toEqual([beerWithBreweriesAndStyles])
    })

    it(`searches beers as ${token.role}`, async () => {
      const result = await beerService.searchBeers(
        async () => [beerWithBreweriesAndStyles],
        {
          authTokenPayload: token,
          searchByName: { name: beer.name }
        },
        log
      )
      expect(result).toEqual([beerWithBreweriesAndStyles])
    })
  })

})
