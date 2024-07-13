import { expect } from 'earl'
import {
  type Brewery,
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  type NewBrewery
} from '../../../src/core/brewery/brewery'
import { breweryNotFoundError } from '../../../src/core/errors'
import { type Pagination } from '../../../src/core/pagination'
import { type SearchByName } from '../../../src/core/search'
import * as breweryService from '../../../src/core/brewery/brewery.service'

import { dummyLog as log } from '../dummy-log'
import { expectReject } from '../controller-error-helper'

const brewery: Brewery = {
  id: 'd804c8fe-8d41-4c8b-88d1-95bdfeb558ef',
  name: 'Koskipanimo',
}

describe('brewery service unit tests', () => {
  it('create brewery', async () => {
    const request: CreateBreweryRequest = {
      name: brewery.name,
    }
    const create = async (newBrewery: NewBrewery) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
      }
      expect(newBrewery).toEqual({ name: brewery.name })
      return result
    }
    const result = await breweryService.createBrewery(create, request, log)
    expect(result).toEqual({
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
      expect(brewery).toEqual(result)
      return result
    }
    const result = await breweryService.updateBrewery(
      update,
      brewery.id,
      request,
      log
    )
    expect(result).toEqual({
      ...request,
      id: brewery.id
    })
  })

  it('find brewery', async () => {
    const finder = async (breweryId: string) => {
      expect(breweryId).toEqual(brewery.id)
      return brewery
    }
    const result = await breweryService.findBreweryById(finder, brewery.id, log)
    expect(result).toEqual(brewery)
  })

  it('fail to find brewery with unknown id', async () => {
    const id = '2f15e28b-ccbf-4afa-aa05-25f43b1e548b'
    const finder = async (searchId: string) => {
      expect(searchId).toEqual(id)
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
      expect(listPagination).toEqual(pagination)
      return [brewery]
    }
    const result = await breweryService.listBreweries(lister, pagination, log)
    expect(result).toEqual([brewery])
  })

  it('search brewerys', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      expect(search).toEqual(searchByName)
      return [brewery]
    }
    const result = await breweryService.searchBreweries(
      searcher,
      searchByName,
      log
    )
    expect(result).toEqual([brewery])
  })
})
