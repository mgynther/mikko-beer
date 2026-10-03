import { suite, test } from '../../../test.js'

import type {
  Beer,
  CreateBeerRequest,
  UpdateBeerRequest,
  NewBeer,
  CreateIf,
  UpdateIf,
} from '../../../../src/logic/beer/beer.js'
import type { Pagination } from '../../../../src/logic/pagination.js'
import type { SearchByName } from '../../../../src/logic/search.js'
import * as beerService from '../../../../src/logic/internal/beer/service.js'

import { dummyLog as log } from '../../dummy-log.js'
import {
  beerNotFoundError,
  referredBreweryNotFoundError,
  referredStyleNotFoundError,
} from '../../../../src/logic/errors.js'
import { expectReject } from '../../controller-error-helper.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import {
  buildBeer,
  buildBeerWithBreweriesAndStyles,
} from '../../beer/builders.js'

const beer = buildBeer()

// A brewery and a style each, so that a lock can fail to find one.
const breweries = ['67a4565b-1bfa-456f-9025-ab687615c6d3']
const styles = ['439bf543-13b7-4de7-a429-e0cb3d372acb']

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

suite('beer service unit tests', () => {
  test('create beer', async () => {
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
      insertBeerBreweries: async (
        beerId: string,
        insertBreweries: string[],
      ) => {
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
      },
    }
    const result = await beerService.createBeer(
      createIf,
      createBeerRequest,
      log,
    )
    assertDeepEqual(result, {
      ...createBeerRequest,
      id: beer.id,
    })
    assertEqual(breweriesInserted, true)
    assertEqual(breweriesLocked, true)
    assertEqual(stylesInserted, true)
    assertEqual(stylesLocked, true)
  })

  test('fail to create beer with invalid brewery', async () => {
    const createIf: CreateIf = {
      create: async () => beer,
      lockBreweries: async () => [],
      lockStyles,
      insertBeerBreweries: async () => {},
      insertBeerStyles: async () => {},
    }
    await expectReject(async () => {
      await beerService.createBeer(createIf, createBeerRequest, log)
    }, referredBreweryNotFoundError)
  })

  test('fail to create beer with invalid style', async () => {
    const createIf: CreateIf = {
      create: async () => beer,
      lockBreweries,
      lockStyles: async () => [],
      insertBeerBreweries: async () => {},
      insertBeerStyles: async () => {},
    }
    await expectReject(async () => {
      await beerService.createBeer(createIf, createBeerRequest, log)
    }, referredStyleNotFoundError)
  })

  test('update beer', async () => {
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
      insertBeerBreweries: async (
        beerId: string,
        insertBreweries: string[],
      ) => {
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
      },
    }
    const result = await beerService.updateBeer(
      updateIf,
      beer.id,
      updateBeerRequest,
      log,
    )
    assertDeepEqual(result, {
      ...updateBeerRequest,
      id: beer.id,
    })
    assertEqual(breweriesDeleted, true)
    assertEqual(breweriesInserted, true)
    assertEqual(breweriesLocked, true)
    assertEqual(stylesDeleted, true)
    assertEqual(stylesInserted, true)
    assertEqual(stylesLocked, true)
  })

  // Its breweries and styles are left alone, as there is no beer to have them.
  test('fail to update beer that does not exist', async () => {
    const updateIf: UpdateIf = {
      update: async () => undefined,
      lockBreweries,
      lockStyles,
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled,
    }
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, beer.id, updateBeerRequest, log)
    }, beerNotFoundError(beer.id))
  })

  test('fail to update beer with invalid brewery', async () => {
    const updateIf: UpdateIf = {
      update: async () => beer,
      lockBreweries: async () => [],
      lockStyles,
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled,
    }
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, beer.id, updateBeerRequest, log)
    }, referredBreweryNotFoundError)
  })

  test('fail to update beer with invalid style', async () => {
    const updateIf: UpdateIf = {
      update: async () => beer,
      lockBreweries,
      lockStyles: async () => [],
      deleteBeerBreweries: notCalled,
      insertBeerBreweries: notCalled,
      deleteBeerStyles: notCalled,
      insertBeerStyles: notCalled,
    }
    await expectReject(async () => {
      await beerService.updateBeer(updateIf, beer.id, updateBeerRequest, log)
    }, referredStyleNotFoundError)
  })

  test('find beer', async () => {
    const found = buildBeerWithBreweriesAndStyles()
    const finder = async (beerId: string) => {
      assertEqual(beerId, found.id)
      return found
    }
    const result = await beerService.findBeerById(finder, found.id, log)
    assertDeepEqual(result, found)
  })

  test('fail to find beer with unknown id', async () => {
    const id = '7b27cdc4-53cf-493a-be92-07924a9f3399'
    const finder = async (searchId: string) => {
      assertEqual(searchId, id)
      return undefined
    }
    await expectReject(async () => {
      await beerService.findBeerById(finder, id, log)
    }, beerNotFoundError(id))
  })

  test('list beers', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80,
    }
    const listed = buildBeerWithBreweriesAndStyles()
    const lister = async (listPagination: Pagination) => {
      assertDeepEqual(listPagination, pagination)
      return [listed]
    }
    const result = await beerService.listBeers(lister, pagination, log)
    assertDeepEqual(result, [listed])
  })

  test('search beers', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const found = buildBeerWithBreweriesAndStyles()
    const searcher = async (search: SearchByName) => {
      assertDeepEqual(search, searchByName)
      return [found]
    }
    const result = await beerService.searchBeers(searcher, searchByName, log)
    assertDeepEqual(result, [found])
  })
})
