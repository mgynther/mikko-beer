import { describe, it } from 'node:test'

import type {
  Beer,
  BeerWithBreweriesAndStyles,
  CreateBeerRequest,
  UpdateBeerRequest,
  NewBeer,
  CreateIf,
  UpdateIf
} from '../../../../src/core/beer/beer'
import type { Pagination } from '../../../../src/core/pagination'
import type { SearchByName } from '../../../../src/core/search'
import * as beerService from '../../../../src/core/internal/beer/service'

import { dummyLog as log } from '../../dummy-log'
import {
  beerNotFoundError,
  referredBreweryNotFoundError,
  referredStyleNotFoundError
} from '../../../../src/core/errors'
import { expectReject } from '../../controller-error-helper'
import { assertDeepEqual, assertEqual } from '../../../assert'

const beer: BeerWithBreweriesAndStyles = {
  id: '406a337c-3107-4307-bd84-be3ec7c7d2f6',
  name: 'Siperia',
  breweries: [{
    id: '67a4565b-1bfa-456f-9025-ab687615c6d3',
    name: 'Koskipanimo'
  }],
  styles: [{
    id: '439bf543-13b7-4de7-a429-e0cb3d372acb',
    name: 'imperial stout'
  }]
}

const breweries = beer.breweries.map(brewery => brewery.id)
const styles = beer.styles.map(style => style.id)

const lockBreweries = async (lockBreweryIds: string[]) => {
  assertDeepEqual(lockBreweryIds, breweries)
  return lockBreweryIds
}

const lockStyles = async (lockStyleIds: string[]) => {
  assertDeepEqual(lockStyleIds, styles)
  return lockStyleIds
}

async function notCalled() {
  throw new Error('must not be called')
}

const createBeerRequest: CreateBeerRequest = {
  name: beer.name,
  breweries,
  styles,
}

const updateBeerRequest: UpdateBeerRequest = {
  name: beer.name,
  breweries,
  styles,
}

describe('beer service unit tests', () => {
  it('create beer', async () => {
    let breweriesInserted = false
    let breweriesLocked = false
    let stylesInserted = false
    let stylesLocked = false
    const createIf: CreateIf = {
      create: async (newBeer: NewBeer) => {
        const result = {
          id: beer.id,
          name: beer.name,
        }
        assertDeepEqual(newBeer, { name: beer.name })
        return result
      },
      lockBreweries: async (breweryIds: string[]) => {
        assertEqual(breweriesLocked, false)
        breweriesLocked = true
        return lockBreweries(breweryIds)
      },
      lockStyles: async (styleIds: string[]) => {
        assertEqual(stylesLocked, false)
        stylesLocked = true
        return lockStyles(styleIds)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        assertEqual(breweriesInserted, false)
        breweriesInserted = true
        assertEqual(beerId, beer.id)
        assertDeepEqual(insertBreweries, breweries)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        assertEqual(stylesInserted, false)
        stylesInserted = true
        assertEqual(beerId, beer.id)
        assertDeepEqual(insertStyles, styles)
      }
    }
    const result = await beerService.createBeer(
      createIf,
      createBeerRequest,
      log
    )
    assertDeepEqual(result, {
      ...createBeerRequest,
      id: beer.id
    })
    assertEqual(breweriesInserted, true)
    assertEqual(breweriesLocked, true)
    assertEqual(stylesInserted, true)
    assertEqual(stylesLocked, true)
  })

  it('fail to create beer with invalid brewery', async () => {
    const createIf: CreateIf = {
      create: async () => beer,
      lockBreweries: async () => [],
      lockStyles,
      insertBeerBreweries: async () => {},
      insertBeerStyles: async () => {}
    }
    expectReject(async () => {
      await beerService.createBeer(createIf, createBeerRequest, log)
    }, referredBreweryNotFoundError)
  })

  it('fail to create beer with invalid style', async () => {
    const createIf: CreateIf = {
      create: async () => beer,
      lockBreweries,
      lockStyles: async () => [],
      insertBeerBreweries: async () => {},
      insertBeerStyles: async () => {}
    }
    expectReject(async () => {
      await beerService.createBeer(createIf, createBeerRequest, log)
    }, referredStyleNotFoundError)
  })

  it('update beer', async () => {
    let breweriesDeleted = false
    let breweriesInserted = false
    let breweriesLocked = false
    let stylesDeleted = false
    let stylesInserted = false
    let stylesLocked = false
    const updateIf: UpdateIf = {
      update: async (beer: Beer) => {
        const result = {
          id: beer.id,
          name: beer.name,
        }
        assertDeepEqual(beer, result)
        return result
      },
      lockBreweries: async (breweryIds: string[]) => {
        breweriesLocked = true
        return lockBreweries(breweryIds)
      },
      lockStyles: async (styleIds: string[]) => {
        stylesLocked = true
        return lockStyles(styleIds)
      },
      deleteBeerBreweries: async (beerId: string) => {
        assertEqual(breweriesDeleted, false)
        breweriesDeleted = true
        assertEqual(beerId, beer.id)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        assertEqual(breweriesDeleted, true)
        assertEqual(breweriesInserted, false)
        breweriesInserted = true
        assertEqual(beerId, beer.id)
        assertDeepEqual(insertBreweries, breweries)
      },
      deleteBeerStyles: async (beerId: string) => {
        assertEqual(stylesDeleted, false)
        stylesDeleted = true
        assertEqual(beerId, beer.id)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        assertEqual(stylesDeleted, true)
        assertEqual(stylesInserted, false)
        stylesInserted = true
        assertEqual(beerId, beer.id)
        assertDeepEqual(insertStyles, styles)
      }
    }
    const result = await beerService.updateBeer(
      updateIf,
      beer.id,
      updateBeerRequest,
      log
    )
    assertDeepEqual(result, {
      ...updateBeerRequest,
      id: beer.id
    })
    assertEqual(breweriesDeleted, true)
    assertEqual(breweriesInserted, true)
    assertEqual(breweriesLocked, true)
    assertEqual(stylesDeleted, true)
    assertEqual(stylesInserted, true)
    assertEqual(stylesLocked, true)
  })

  it('fail to update beer with invalid brewery', async () => {
    const updateIf: UpdateIf = {
      update: async () => beer,
      lockBreweries: async () => [],
      lockStyles,
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled
    }
    expectReject(async () => {
      await beerService.updateBeer(
        updateIf,
        beer.id,
        updateBeerRequest,
        log
      )
    }, referredBreweryNotFoundError)
  })

  it('fail to update beer with invalid style', async () => {
    const updateIf: UpdateIf = {
      update: async () => beer,
      lockBreweries,
      lockStyles: async () => [],
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled
    }
    expectReject(async () => {
      await beerService.updateBeer(
        updateIf,
        beer.id,
        updateBeerRequest,
        log
      )
    }, referredStyleNotFoundError)
  })

  it('find beer', async () => {
    const finder = async (beerId: string) => {
      assertEqual(beerId, beer.id)
      return beer
    }
    const result = await beerService.findBeerById(finder, beer.id, log)
    assertDeepEqual(result, beer)
  })

  it('fail to find beer with unknown id', async () => {
    const id = '7b27cdc4-53cf-493a-be92-07924a9f3399'
    const finder = async (searchId: string) => {
      assertEqual(searchId, id)
      return undefined
    }
    expectReject(async () => {
      await beerService.findBeerById(finder, id, log)
    }, beerNotFoundError(id))
  })

  it('list beers', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async (listPagination: Pagination) => {
      assertDeepEqual(listPagination, pagination)
      return [beer]
    }
    const result = await beerService.listBeers(lister, pagination, log)
    assertDeepEqual(result, [beer])
  })

  it('search beers', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      assertDeepEqual(search, searchByName)
      return [beer]
    }
    const result = await beerService.searchBeers(searcher, searchByName, log)
    assertDeepEqual(result, [beer])
  })
})
