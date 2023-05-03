import * as beerRepository from './beer.repository'

import { type Database, type Transaction } from '../database'
import {
  type CreateBeerRequest,
  type UpdateBeerRequest,
  type Beer,
  type BeerWithBreweryAndStyleIds,
  type BeerWithBreweriesAndStyles
} from './beer'
import { type BeerRow } from './beer.table'

import {
  type Pagination
} from '../util/pagination'
import { type SearchByName } from '../util/search'

export async function createBeer (
  trx: Transaction,
  request: CreateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
  const beer = await beerRepository.insertBeer(trx, {
    name: request.name
  })

  // TODO It might be a good idea to insert all on one request.
  const breweries = (request.breweries != null)
    ? request.breweries.map(async (brewery) => {
      return await beerRepository.insertBeerBrewery(trx, {
        beer: beer.beer_id,
        brewery
      })
    })
    : []
  await Promise.all(breweries)

  const styles = (request.styles != null)
    ? request.styles.map(async (style) => {
      return await beerRepository.insertBeerStyle(trx, {
        beer: beer.beer_id,
        style
      })
    })
    : []
  await Promise.all(styles)

  return {
    ...beerRowToBeer(beer),
    breweries: request.breweries,
    styles: request.styles
  }
}

export async function updateBeer (
  trx: Transaction,
  beerId: string,
  request: UpdateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
  const beer = await beerRepository.updateBeer(trx, beerId, {
    name: request.name
  })

  await beerRepository.deleteBeerBreweries(trx, beerId)
  await beerRepository.deleteBeerStyles(trx, beerId)

  // TODO It might be a good idea to insert all on one request.
  const breweries = (request.breweries != null)
    ? request.breweries.map(async (brewery) => {
      return await beerRepository.insertBeerBrewery(trx, {
        beer: beer.beer_id,
        brewery
      })
    })
    : []
  await Promise.all(breweries)

  const styles = (request.styles != null)
    ? request.styles.map(async (style) => {
      return await beerRepository.insertBeerStyle(trx, {
        beer: beer.beer_id,
        style
      })
    })
    : []
  await Promise.all(styles)

  return {
    ...beerRowToBeer(beer),
    breweries: request.breweries,
    styles: request.styles
  }
}

export async function findBeerById (
  db: Database,
  beerId: string
): Promise<BeerWithBreweriesAndStyles | undefined> {
  const beer = await beerRepository.findBeerById(db, beerId)

  if (beer === null || beer === undefined) return undefined

  return beer
}

export async function lockBeerById (
  trx: Transaction,
  id: string
): Promise<Beer | undefined> {
  const beerRow = await beerRepository.lockBeerById(trx, id)

  if (beerRow != null) {
    return beerRowToBeer(beerRow)
  }
}

export async function listBeers (
  db: Database,
  pagination: Pagination
): Promise<BeerWithBreweriesAndStyles[]> {
  return await beerRepository.listBeers(db, pagination)
}

export async function searchBeers (
  db: Database,
  searchRequest: SearchByName
): Promise<BeerWithBreweriesAndStyles[]> {
  return await beerRepository.searchBeers(db, searchRequest)
}

export function beerRowToBeer (beer: BeerRow): Beer {
  return {
    id: beer.beer_id,
    name: beer.name
  }
}
