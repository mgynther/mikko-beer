import { expect } from 'chai'
import {
  type Beer,
  type BeerWithBreweriesAndStyles,
  type CreateBeerRequest,
  type UpdateBeerRequest,
  type NewBeer
} from '../../../src/core/beer/beer'
import { type Pagination } from '../../../src/core/pagination'
import { type SearchByName } from '../../../src/core/search'
import * as beerService from '../../../src/core/beer/beer.service'

import { dummyLog as log } from '../dummy-log'
import {
  beerNotFoundError,
  referredBreweryNotFoundError,
  referredStyleNotFoundError
} from '../../../src/core/errors'

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
  expect(lockBreweryIds).to.eql(breweries)
  return lockBreweryIds
}

const lockStyles = async (lockStyleIds: string[]) => {
  expect(lockStyleIds).to.eql(styles)
  return lockStyleIds
}

async function notCalled() {
  expect('must not be called').to.equal(true)
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
    const createIf: beerService.CreateIf = {
      create: async (newBeer: NewBeer) => {
        const result = {
          id: beer.id,
          name: beer.name,
        }
        expect(newBeer).to.eql({ name: beer.name })
        return result
      },
      lockBreweries: async (breweryIds: string[]) => {
        expect(breweriesLocked).to.equal(false)
        breweriesLocked = true
        return lockBreweries(breweryIds)
      },
      lockStyles: async (styleIds: string[]) => {
        expect(stylesLocked).to.equal(false)
        stylesLocked = true
        return lockStyles(styleIds)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        expect(breweriesInserted).to.equal(false)
        breweriesInserted = true
        expect(beerId).to.equal(beer.id)
        expect(insertBreweries).to.eql(breweries)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        expect(stylesInserted).to.equal(false)
        stylesInserted = true
        expect(beerId).to.equal(beer.id)
        expect(insertStyles).to.eql(styles)
      }
    }
    const result = await beerService.createBeer(
      createIf,
      createBeerRequest,
      log
    )
    expect(result).to.eql({
      ...createBeerRequest,
      id: beer.id
    })
    expect(breweriesInserted).to.equal(true)
    expect(breweriesLocked).to.equal(true)
    expect(stylesInserted).to.equal(true)
    expect(stylesLocked).to.equal(true)
  })

  it('fail to create beer with invalid brewery', async () => {
    const createIf: beerService.CreateIf = {
      create: async () => beer,
      lockBreweries: async () => [],
      lockStyles,
      insertBeerBreweries: async () => {},
      insertBeerStyles: async () => {}
    }
    try {
      await beerService.createBeer(createIf, createBeerRequest, log)
      notCalled()
    } catch (e) {
      expect(e).to.eql(referredBreweryNotFoundError)
    }
  })

  it('fail to create beer with invalid style', async () => {
    const createIf: beerService.CreateIf = {
      create: async () => beer,
      lockBreweries,
      lockStyles: async () => [],
      insertBeerBreweries: async () => {},
      insertBeerStyles: async () => {}
    }
    try {
      await beerService.createBeer(createIf, createBeerRequest, log)
      notCalled()
    } catch (e) {
      expect(e).to.eql(referredStyleNotFoundError)
    }
  })

  it('update beer', async () => {
    let breweriesDeleted = false
    let breweriesInserted = false
    let breweriesLocked = false
    let stylesDeleted = false
    let stylesInserted = false
    let stylesLocked = false
    const updateIf: beerService.UpdateIf = {
      update: async (beer: Beer) => {
        const result = {
          id: beer.id,
          name: beer.name,
        }
        expect(beer).to.eql(result)
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
        expect(breweriesDeleted).to.equal(false)
        breweriesDeleted = true
        expect(beerId).to.equal(beer.id)
      },
      insertBeerBreweries: async (beerId: string, insertBreweries: string[]) => {
        expect(breweriesDeleted).to.equal(true)
        expect(breweriesInserted).to.equal(false)
        breweriesInserted = true
        expect(beerId).to.equal(beer.id)
        expect(insertBreweries).to.eql(breweries)
      },
      deleteBeerStyles: async (beerId: string) => {
        expect(stylesDeleted).to.equal(false)
        stylesDeleted = true
        expect(beerId).to.equal(beer.id)
      },
      insertBeerStyles: async (beerId: string, insertStyles: string[]) => {
        expect(stylesDeleted).to.equal(true)
        expect(stylesInserted).to.equal(false)
        stylesInserted = true
        expect(beerId).to.equal(beer.id)
        expect(insertStyles).to.eql(styles)
      }
    }
    const result = await beerService.updateBeer(
      updateIf,
      beer.id,
      updateBeerRequest,
      log
    )
    expect(result).to.eql({
      ...updateBeerRequest,
      id: beer.id
    })
    expect(breweriesDeleted).to.equal(true)
    expect(breweriesInserted).to.equal(true)
    expect(breweriesLocked).to.equal(true)
    expect(stylesDeleted).to.equal(true)
    expect(stylesInserted).to.equal(true)
    expect(stylesLocked).to.equal(true)
  })

  it('fail to update beer with invalid brewery', async () => {
    const updateIf: beerService.UpdateIf = {
      update: async () => beer,
      lockBreweries: async () => [],
      lockStyles,
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled
    }
    try {
      await beerService.updateBeer(
        updateIf,
        beer.id,
        updateBeerRequest,
        log
      )
    } catch (e) {
      expect(e).to.eql(referredBreweryNotFoundError)
    }
  })

  it('fail to update beer with invalid style', async () => {
    const updateIf: beerService.UpdateIf = {
      update: async () => beer,
      lockBreweries,
      lockStyles: async () => [],
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled
    }
    try {
      await beerService.updateBeer(
        updateIf,
        beer.id,
        updateBeerRequest,
        log
      )
    } catch (e) {
      expect(e).to.eql(referredStyleNotFoundError)
    }
})

  it('find beer', async () => {
    const finder = async (beerId: string) => {
      expect(beerId).to.equal(beer.id)
      return beer
    }
    const result = await beerService.findBeerById(finder, beer.id, log)
    expect(result).to.eql(beer)
  })

  it('fail to find beer with unknown id', async () => {
    const id = '7b27cdc4-53cf-493a-be92-07924a9f3399'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    try {
      await beerService.findBeerById(finder, id, log)
      notCalled()
    } catch (e) {
      expect(e).to.eql(beerNotFoundError(id))
    }
  })

  it('list beers', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async (listPagination: Pagination) => {
      expect(listPagination).to.eql(pagination)
      return [beer]
    }
    const result = await beerService.listBeers(lister, pagination, log)
    expect(result).to.eql([beer])
  })

  it('search beers', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      expect(search).to.eql(searchByName)
      return [beer]
    }
    const result = await beerService.searchBeers(searcher, searchByName, log)
    expect(result).to.eql([beer])
  })
})
