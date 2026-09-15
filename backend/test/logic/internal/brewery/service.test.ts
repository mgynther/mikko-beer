import { describe, it } from 'node:test'

import type {
  Brewery,
  CreateBreweryRequest,
  UpdateBreweryRequest,
} from '../../../../src/logic/brewery/brewery.js'
import { breweryNotFoundError } from '../../../../src/logic/errors.js'
import type { Pagination } from '../../../../src/logic/pagination.js'
import type { SearchByName } from '../../../../src/logic/search.js'
import * as breweryService from '../../../../src/logic/internal/brewery/service.js'

import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'

const brewery: Brewery = {
  id: 'd804c8fe-8d41-4c8b-88d1-95bdfeb558ef',
  name: 'Koskipanimo',
  country: undefined,
}

describe('brewery service unit tests', () => {
  it('create brewery', async () => {
    const request: CreateBreweryRequest = {
      name: brewery.name,
      country: undefined,
    }
    const create = async (newBrewery: CreateBreweryRequest) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
        country: newBrewery.country,
      }
      assertDeepEqual(newBrewery, { name: brewery.name, country: undefined })
      return result
    }
    const result = await breweryService.createBrewery(create, request, log)
    assertDeepEqual(result, {
      ...request,
      id: brewery.id,
      country: undefined,
    })
  })

  it('create brewery with country', async () => {
    const request: CreateBreweryRequest = {
      name: brewery.name,
      country: 'FI',
    }
    const create = async (newBrewery: CreateBreweryRequest) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
        country: newBrewery.country,
      }
      assertDeepEqual(newBrewery, { name: brewery.name, country: 'FI' })
      return result
    }
    const result = await breweryService.createBrewery(create, request, log)
    assertDeepEqual(result, {
      ...request,
      id: brewery.id,
    })
  })

  it('update brewery', async () => {
    const request: UpdateBreweryRequest = {
      name: brewery.name,
      country: undefined,
    }
    const update = async (brewery: Brewery) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
        country: brewery.country,
      }
      assertDeepEqual(brewery, result)
      return result
    }
    const result = await breweryService.updateBrewery(
      update,
      brewery.id,
      request,
      log,
    )
    assertDeepEqual(result, {
      ...request,
      id: brewery.id,
      country: undefined,
    })
  })

  it('update brewery country', async () => {
    const request: UpdateBreweryRequest = {
      name: brewery.name,
      country: 'FI',
    }
    const update = async (brewery: Brewery) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
        country: brewery.country,
      }
      assertDeepEqual(brewery, {
        id: brewery.id,
        name: brewery.name,
        country: 'FI',
      })
      return result
    }
    const result = await breweryService.updateBrewery(
      update,
      brewery.id,
      request,
      log,
    )
    assertDeepEqual(result, {
      ...request,
      id: brewery.id,
    })
  })

  it('find brewery', async () => {
    const finder = async (breweryId: string) => {
      assertEqual(breweryId, brewery.id)
      return brewery
    }
    const result = await breweryService.findBreweryById(finder, brewery.id, log)
    assertDeepEqual(result, brewery)
  })

  it('fail to find brewery with unknown id', async () => {
    const id = '2f15e28b-ccbf-4afa-aa05-25f43b1e548b'
    const finder = async (searchId: string) => {
      assertEqual(searchId, id)
      return undefined
    }
    await expectReject(async () => {
      await breweryService.findBreweryById(finder, id, log)
    }, breweryNotFoundError(id))
  })

  it('list brewerys', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80,
    }
    const lister = async (listPagination: Pagination) => {
      assertDeepEqual(listPagination, pagination)
      return [brewery]
    }
    const result = await breweryService.listBreweries(lister, pagination, log)
    assertDeepEqual(result, [brewery])
  })

  it('search brewerys', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      assertDeepEqual(search, searchByName)
      return [brewery]
    }
    const result = await breweryService.searchBreweries(
      searcher,
      searchByName,
      log,
    )
    assertDeepEqual(result, [brewery])
  })
})
