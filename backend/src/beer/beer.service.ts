import * as beerRepository from './beer.repository'

import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type CreateBeerRequest, type UpdateBeerRequest, type Beer, type BeerWithBreweryAndStyleIds, type BeerWithBreweriesAndStyles } from './beer'
import { type BeerRow } from './beer.table'
import { type BreweryRow } from '../brewery/brewery.table'
import { type StyleRow } from '../style/style.table'

export async function createBeer (
  db: Kysely<Database>,
  request: CreateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
  const beer = await beerRepository.insertBeer(db, {
    name: request.name
  })

  // TODO It might be a good idea to insert all on one request.
  const breweries = (request.breweries != null)
    ? request.breweries.map(async (brewery) => {
      return await beerRepository.insertBeerBrewery(db, {
        beer: beer.beer_id,
        brewery
      })
    })
    : []
  await Promise.all(breweries)

  const styles = (request.styles != null)
    ? request.styles.map(async (style) => {
      return await beerRepository.insertBeerStyle(db, {
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
  db: Kysely<Database>,
  beerId: string,
  request: UpdateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
  const beer = await beerRepository.updateBeer(db, beerId, {
    name: request.name
  })

  await beerRepository.deleteBeerBreweries(db, beerId)
  await beerRepository.deleteBeerStyles(db, beerId)

  // TODO It might be a good idea to insert all on one request.
  const breweries = (request.breweries != null)
    ? request.breweries.map(async (brewery) => {
      return await beerRepository.insertBeerBrewery(db, {
        beer: beer.beer_id,
        brewery
      })
    })
    : []
  await Promise.all(breweries)

  const styles = (request.styles != null)
    ? request.styles.map(async (style) => {
      return await beerRepository.insertBeerStyle(db, {
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
  db: Kysely<Database>,
  beerId: string
): Promise<BeerWithBreweriesAndStyles | undefined> {
  const beer = await beerRepository.findBeerById(db, beerId)

  if (beer === null || beer === undefined) return undefined

  return beer
}

export async function lockBeerById (
  trx: Transaction<Database>,
  id: string
): Promise<Beer | undefined> {
  const beerRow = await beerRepository.lockBeerById(trx, id)

  if (beerRow != null) {
    return beerRowToBeer(beerRow)
  }
}

export async function listBeers (
  db: Kysely<Database>
): Promise<Beer[] | undefined> {
  const beerRows = await beerRepository.listBeers(db)

  if (beerRows === null || beerRows === undefined) return []

  return beerRows.map(row => ({
    ...beerRowToBeer(row)
  }))
}

export function beerRowToBeer (beer: BeerRow): Beer {
  return {
    id: beer.beer_id,
    name: beer.name
  }
}
