import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

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
import { assertDeepEqual } from '../../../assert'

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
        assert.equal(breweriesLocked, false)
        breweriesLocked = true
        return lockBreweries(breweryIds)
      },
      lockStyles: async (styleIds: string[]) => {
        assert.equal(stylesLocked, false)
        stylesLocked = true
        return lockStyles(styleIds)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        assert.equal(breweriesInserted, false)
        breweriesInserted = true
        assert.equal(beerId, beer.id)
        assertDeepEqual(insertBreweries, breweries)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        assert.equal(stylesInserted, false)
        stylesInserted = true
        assert.equal(beerId, beer.id)
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
    assert.equal(breweriesInserted, true)
    assert.equal(breweriesLocked, true)
    assert.equal(stylesInserted, true)
    assert.equal(stylesLocked, true)
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
        assert.equal(breweriesDeleted, false)
        breweriesDeleted = true
        assert.equal(beerId, beer.id)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        assert.equal(breweriesDeleted, true)
        assert.equal(breweriesInserted, false)
        breweriesInserted = true
        assert.equal(beerId, beer.id)
        assertDeepEqual(insertBreweries, breweries)
      },
      deleteBeerStyles: async (beerId: string) => {
        assert.equal(stylesDeleted, false)
        stylesDeleted = true
        assert.equal(beerId, beer.id)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        assert.equal(stylesDeleted, true)
        assert.equal(stylesInserted, false)
        stylesInserted = true
        assert.equal(beerId, beer.id)
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
    assert.equal(breweriesDeleted, true)
    assert.equal(breweriesInserted, true)
    assert.equal(breweriesLocked, true)
    assert.equal(stylesDeleted, true)
    assert.equal(stylesInserted, true)
    assert.equal(stylesLocked, true)
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
      assert.equal(beerId, beer.id)
      return beer
    }
    const result = await beerService.findBeerById(finder, beer.id, log)
    assertDeepEqual(result, beer)
  })

  it('fail to find beer with unknown id', async () => {
    const id = '7b27cdc4-53cf-493a-be92-07924a9f3399'
    const finder = async (searchId: string) => {
      assert.equal(searchId, id)
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
