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

describe('beer service unit tests', () => {
  it('should create beer', async () => {
    const breweries = beer.breweries.map(brewery => brewery.id)
    const styles = beer.styles.map(style => style.id)
    const request: CreateBeerRequest = {
      name: beer.name,
      breweries,
      styles,
    }
    let breweriesInserted = false
    let stylesInserted = false
    const createIf: beerService.CreateIf = {
      create: async (newBeer: NewBeer) => {
        const result = {
          id: beer.id,
          name: beer.name,
        }
        expect(newBeer).to.eql({ name: beer.name })
        return result
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
    const result = await beerService.createBeer(createIf, request)
    expect(result).to.eql({
      ...request,
      id: beer.id
    })
    expect(breweriesInserted).to.equal(true)
    expect(stylesInserted).to.equal(true)
  })

  it('should update beer', async () => {
    const breweries = beer.breweries.map(brewery => brewery.id)
    const styles = beer.styles.map(style => style.id)
    const request: UpdateBeerRequest = {
      name: beer.name,
      breweries,
      styles,
    }
    let breweriesDeleted = false
    let breweriesInserted = false
    let stylesDeleted = false
    let stylesInserted = false
    const updateIf: beerService.UpdateIf = {
      update: async (beer: Beer) => {
        const result = {
          id: beer.id,
          name: beer.name,
        }
        expect(beer).to.eql(result)
        return result
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
    const result = await beerService.updateBeer(updateIf, beer.id, request)
    expect(result).to.eql({
      ...request,
      id: beer.id
    })
    expect(breweriesDeleted).to.equal(true)
    expect(breweriesInserted).to.equal(true)
    expect(stylesDeleted).to.equal(true)
    expect(stylesInserted).to.equal(true)
  })

  it('should find beer', async () => {
    const finder = async (beerId: string) => {
      expect(beerId).to.equal(beer.id)
      return beer
    }
    const result = await beerService.findBeerById(finder, beer.id)
    expect(result).to.eql(beer)
  })

  it('should not find beer with unknown id', async () => {
    const id = '7b27cdc4-53cf-493a-be92-07924a9f3399'
    const finder = async (searchId: string) => {
      expect(searchId).to.equal(id)
      return undefined
    }
    const result = await beerService.findBeerById(finder, id)
    expect(result).to.eql(undefined)
  })

  it('should list beers', async () => {
    const pagination: Pagination = {
      size: 10,
      skip: 80
    }
    const lister = async (listPagination: Pagination) => {
      expect(listPagination).to.eql(pagination)
      return [beer]
    }
    const result = await beerService.listBeers(lister, pagination)
    expect(result).to.eql([beer])
  })

  it('should search beers', async () => {
    const searchByName: SearchByName = {
      name: 'Sipe',
    }
    const searcher = async (search: SearchByName) => {
      expect(search).to.eql(searchByName)
      return [beer]
    }
    const result = await beerService.searchBeers(searcher, searchByName)
    expect(result).to.eql([beer])
  })
})
