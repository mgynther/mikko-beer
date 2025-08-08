import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import type {
  Brewery,
  CreateBreweryRequest,
  UpdateBreweryRequest
} from '../../../../src/core/brewery/brewery'
import { breweryNotFoundError } from '../../../../src/core/errors'
import type { Pagination } from '../../../../src/core/pagination'
import type { SearchByName } from '../../../../src/core/search'
import * as breweryService from '../../../../src/core/internal/brewery/service'

import { dummyLog as log } from '../../dummy-log'
import { expectReject } from '../../controller-error-helper'

const brewery: Brewery = {
  id: 'd804c8fe-8d41-4c8b-88d1-95bdfeb558ef',
  name: 'Koskipanimo',
}

describe('brewery service unit tests', () => {
  it('create brewery', async () => {
    const request: CreateBreweryRequest = {
      name: brewery.name,
    }
    const create = async (newBrewery: CreateBreweryRequest) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
      }
      assert.deepEqual(newBrewery, { name: brewery.name })
      return result
    }
    const result = await breweryService.createBrewery(create, request, log)
    assert.deepEqual(result, {
      ...request,
      id: brewery.id
    })
  })

  it('update brewery', async () => {
    const request: UpdateBreweryRequest = {
      name: brewery.name,
    }
    const update = async (brewery: Brewery) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
      }
      assert.deepEqual(brewery, result)
      return result
    }
    const result = await breweryService.updateBrewery(
      update,
      brewery.id,
      request,
      log
    )
    assert.deepEqual(result, {
      ...request,
      id: brewery.id
    })
  })

  it('find brewery', async () => {
    const finder = async (breweryId: string) => {
      assert.equal(breweryId, brewery.id)
      return brewery
    }
    const result = await breweryService.findBreweryById(finder, brewery.id, log)
    assert.deepEqual(result, brewery)
  })

  it('fail to find brewery with unknown id', async () => {
    const id = '2f15e28b-ccbf-4afa-aa05-25f43b1e548b'
    const finder = async (searchId: string) => {
      assert.equal(searchId, id)
      return undefined
    }
    expectReject(async () => {
      await breweryService.findBreweryById(finder, id, log)
    }, breweryNotFoundError(id))
  })

  it('list brewerys', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async (listPagination: Pagination) => {
      assert.deepEqual(listPagination, pagination)
      return [brewery]
    }
    const result = await breweryService.listBreweries(lister, pagination, log)
    assert.deepEqual(result, [brewery])
  })

  it('search brewerys', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      assert.deepEqual(search, searchByName)
      return [brewery]
    }
    const result = await breweryService.searchBreweries(
      searcher,
      searchByName,
      log
    )
    assert.deepEqual(result, [brewery])
  })
})
