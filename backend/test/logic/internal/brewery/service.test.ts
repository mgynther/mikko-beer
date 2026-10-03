import { suite, test } from '../../../test.js'

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
import { buildBrewery } from '../../brewery/builders.js'

const brewery = buildBrewery()

suite('brewery service unit tests', () => {
  test('create brewery', async () => {
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

  test('create brewery with country', async () => {
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

  test('update brewery', async () => {
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

  test('update brewery country', async () => {
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

  test('fail to update brewery that does not exist', async () => {
    const update = async (): Promise<undefined> => undefined
    await expectReject(async () => {
      await breweryService.updateBrewery(
        update,
        brewery.id,
        { name: brewery.name, country: 'BE' },
        log,
      )
    }, breweryNotFoundError(brewery.id))
  })

  test('find brewery', async () => {
    const finder = async (breweryId: string) => {
      assertEqual(breweryId, brewery.id)
      return brewery
    }
    const result = await breweryService.findBreweryById(finder, brewery.id, log)
    assertDeepEqual(result, brewery)
  })

  test('fail to find brewery with unknown id', async () => {
    const id = '2f15e28b-ccbf-4afa-aa05-25f43b1e548b'
    const finder = async (searchId: string) => {
      assertEqual(searchId, id)
      return undefined
    }
    await expectReject(async () => {
      await breweryService.findBreweryById(finder, id, log)
    }, breweryNotFoundError(id))
  })

  test('list brewerys', async () => {
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

  test('search brewerys', async () => {
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
