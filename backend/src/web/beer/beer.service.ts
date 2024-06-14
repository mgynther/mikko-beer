import * as beerRepository from '../../data/beer/beer.repository'

import { type Database, type Transaction } from '../../data/database'
import {
  type CreateBeerRequest,
  type UpdateBeerRequest,
  type Beer,
  type BeerWithBreweryAndStyleIds,
  type BeerWithBreweriesAndStyles
} from '../../core/beer/beer'
import { type BeerRow } from '../../data/beer/beer.table'

import {
  type Pagination
} from '../../core/pagination'
import { type SearchByName } from '../../web/search'

export async function createBeer (
  trx: Transaction,
  request: CreateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
  const beer = await beerRepository.insertBeer(trx, {
    name: request.name
  })

  await Promise.all([
    request.breweries === null ? () => {} :
      beerRepository.insertBeerBreweries(trx, request.breweries.map(brewery => ({
        beer: beer.beer_id,
        brewery
      }))),
    request.styles === null ? () => {} :
      beerRepository.insertBeerStyles(trx, request.styles.map(style => ({
        beer: beer.beer_id,
        style
      }))),
  ])

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

  await Promise.all([
    beerRepository.deleteBeerBreweries(trx, beerId),
    beerRepository.deleteBeerStyles(trx, beerId),
    request.breweries === null ? () => {} :
      beerRepository.insertBeerBreweries(trx, request.breweries.map(brewery => ({
        beer: beer.beer_id,
        brewery
      }))),
    request.styles === null ? () => {} :
      beerRepository.insertBeerStyles(trx, request.styles.map(style => ({
        beer: beer.beer_id,
        style
      }))),
  ])

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
