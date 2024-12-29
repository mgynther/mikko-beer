import { expect } from 'earl'
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
  expect(lockBreweryIds).toEqual(breweries)
  return lockBreweryIds
}

const lockStyles = async (lockStyleIds: string[]) => {
  expect(lockStyleIds).toEqual(styles)
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
        expect(newBeer).toEqual({ name: beer.name })
        return result
      },
      lockBreweries: async (breweryIds: string[]) => {
        expect(breweriesLocked).toEqual(false)
        breweriesLocked = true
        return lockBreweries(breweryIds)
      },
      lockStyles: async (styleIds: string[]) => {
        expect(stylesLocked).toEqual(false)
        stylesLocked = true
        return lockStyles(styleIds)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        expect(breweriesInserted).toEqual(false)
        breweriesInserted = true
        expect(beerId).toEqual(beer.id)
        expect(insertBreweries).toEqual(breweries)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        expect(stylesInserted).toEqual(false)
        stylesInserted = true
        expect(beerId).toEqual(beer.id)
        expect(insertStyles).toEqual(styles)
      }
    }
    const result = await beerService.createBeer(
      createIf,
      createBeerRequest,
      log
    )
    expect(result).toEqual({
      ...createBeerRequest,
      id: beer.id
    })
    expect(breweriesInserted).toEqual(true)
    expect(breweriesLocked).toEqual(true)
    expect(stylesInserted).toEqual(true)
    expect(stylesLocked).toEqual(true)
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
        expect(beer).toEqual(result)
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
        expect(breweriesDeleted).toEqual(false)
        breweriesDeleted = true
        expect(beerId).toEqual(beer.id)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        expect(breweriesDeleted).toEqual(true)
        expect(breweriesInserted).toEqual(false)
        breweriesInserted = true
        expect(beerId).toEqual(beer.id)
        expect(insertBreweries).toEqual(breweries)
      },
      deleteBeerStyles: async (beerId: string) => {
        expect(stylesDeleted).toEqual(false)
        stylesDeleted = true
        expect(beerId).toEqual(beer.id)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        expect(stylesDeleted).toEqual(true)
        expect(stylesInserted).toEqual(false)
        stylesInserted = true
        expect(beerId).toEqual(beer.id)
        expect(insertStyles).toEqual(styles)
      }
    }
    const result = await beerService.updateBeer(
      updateIf,
      beer.id,
      updateBeerRequest,
      log
    )
    expect(result).toEqual({
      ...updateBeerRequest,
      id: beer.id
    })
    expect(breweriesDeleted).toEqual(true)
    expect(breweriesInserted).toEqual(true)
    expect(breweriesLocked).toEqual(true)
    expect(stylesDeleted).toEqual(true)
    expect(stylesInserted).toEqual(true)
    expect(stylesLocked).toEqual(true)
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
      expect(beerId).toEqual(beer.id)
      return beer
    }
    const result = await beerService.findBeerById(finder, beer.id, log)
    expect(result).toEqual(beer)
  })

  it('fail to find beer with unknown id', async () => {
    const id = '7b27cdc4-53cf-493a-be92-07924a9f3399'
    const finder = async (searchId: string) => {
      expect(searchId).toEqual(id)
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
      expect(listPagination).toEqual(pagination)
      return [beer]
    }
    const result = await beerService.listBeers(lister, pagination, log)
    expect(result).toEqual([beer])
  })

  it('search beers', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      expect(search).toEqual(searchByName)
      return [beer]
    }
    const result = await beerService.searchBeers(searcher, searchByName, log)
    expect(result).toEqual([beer])
  })
})
