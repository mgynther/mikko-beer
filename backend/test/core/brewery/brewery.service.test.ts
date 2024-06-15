import { expect } from 'chai'
import {
  type Brewery,
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  type NewBrewery
} from '../../../src/core/brewery/brewery'
import { type Pagination } from '../../../src/core/pagination'
import { type SearchByName } from '../../../src/core/search'
import * as breweryService from '../../../src/core/brewery/brewery.service'

const brewery: Brewery = {
  id: 'd804c8fe-8d41-4c8b-88d1-95bdfeb558ef',
  name: 'Koskipanimo',
}

describe('brewery service unit tests', () => {
  it('should create brewery', async () => {
    const request: CreateBreweryRequest = {
      name: brewery.name,
    }
    const create = async (newBrewery: NewBrewery) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
      }
      expect(newBrewery).to.eql({ name: brewery.name })
      return result
    }
    const result = await breweryService.createBrewery(create, request)
    expect(result).to.eql({
      ...request,
      id: brewery.id
    })
  })

  it('should update brewery', async () => {
    const request: UpdateBreweryRequest = {
      name: brewery.name,
    }
    const update = async (brewery: Brewery) => {
      const result = {
        id: brewery.id,
        name: brewery.name,
      }
      expect(brewery).to.eql(result)
      return result
    }
    const result = await breweryService.updateBrewery(update, brewery.id, request)
    expect(result).to.eql({
      ...request,
      id: brewery.id
    })
  })

  it('should find brewery', async () => {
    const finder = async (breweryId: string) => {
      expect(breweryId).to.equal(brewery.id)
      return brewery
    }
    const result = await breweryService.findBreweryById(finder, brewery.id)
    expect(result).to.eql(brewery)
  })

  it('should not find brewery with unknown id', async () => {
    const id = '2f15e28b-ccbf-4afa-aa05-25f43b1e548b'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    const result = await breweryService.findBreweryById(finder, id)
    expect(result).to.eql(undefined)
  })

  it('should list brewerys', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async (listPagination: Pagination) => {
      expect(listPagination).to.eql(pagination)
      return [brewery]
    }
    const result = await breweryService.listBreweries(lister, pagination)
    expect(result).to.eql([brewery])
  })

  it('should search brewerys', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      expect(search).to.eql(searchByName)
      return [brewery]
    }
    const result = await breweryService.searchBreweries(searcher, searchByName)
    expect(result).to.eql([brewery])
  })
})
