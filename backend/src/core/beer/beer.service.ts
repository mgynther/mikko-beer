import type {
  CreateBeerRequest,
  UpdateBeerRequest,
  Beer,
  BeerWithBreweryAndStyleIds,
  BeerWithBreweriesAndStyles,
  NewBeer
} from './beer'

import {
  beerNotFoundError,
  referredBreweryNotFoundError,
  referredStyleNotFoundError
} from '../errors'
import { INFO, type log } from '../log'
import type {
  Pagination
} from '../pagination'
import type { SearchByName } from '../search'
import { areKeysEqual } from '../key'

type InsertBreweries = (beerId: string, breweries: string[]) => Promise<void>
type InsertStyles = (beerId: string, styles: string[]) => Promise<void>
type LockIds = (ids: string[]) => Promise<string[]>

export interface CreateIf {
  create: (beer: NewBeer) => Promise<Beer>
  lockBreweries: LockIds
  lockStyles: LockIds
  insertBeerBreweries: InsertBreweries
  insertBeerStyles: InsertStyles
}

export async function createBeer (
  createIf: CreateIf,
  request: CreateBeerRequest,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  log(INFO, 'create beer with name', request.name)
  await lockIds(
    createIf.lockBreweries,
    request.breweries,
    referredBreweryNotFoundError
  )
  await lockIds(createIf.lockStyles, request.styles, referredStyleNotFoundError)
  const beer = await createIf.create({
    name: request.name
  })

  await Promise.all([
    createIf.insertBeerBreweries(beer.id, request.breweries),
    createIf.insertBeerStyles(beer.id, request.styles)
  ])

  log(INFO, 'created beer with name', beer.name, 'and id', beer.id)
  return {
    id: beer.id,
    name: beer.name,
    breweries: request.breweries,
    styles: request.styles
  }
}

export interface UpdateIf {
  update: (beer: Beer) => Promise<Beer>
  lockBreweries: LockIds
  lockStyles: LockIds
  insertBeerBreweries: InsertBreweries
  deleteBeerBreweries: (beerId: string) => Promise<void>
  insertBeerStyles: InsertStyles
  deleteBeerStyles: (beerId: string) => Promise<void>
}

export async function updateBeer (
  updateIf: UpdateIf,
  beerId: string,
  request: UpdateBeerRequest,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  log(INFO, 'update beer with id', beerId)
  await lockIds(
    updateIf.lockBreweries,
    request.breweries,
    referredBreweryNotFoundError
  )
  await lockIds(updateIf.lockStyles, request.styles, referredStyleNotFoundError)
  await Promise.all([
    updateIf.update({
      id: beerId,
      name: request.name
    }),
    updateIf.deleteBeerBreweries(beerId),
    updateIf.deleteBeerStyles(beerId),
    updateIf.insertBeerBreweries(beerId, request.breweries),
    updateIf.insertBeerStyles(beerId, request.styles)
  ])

  log(INFO, 'updated beer with id', beerId)
  return {
    id: beerId,
    name: request.name,
    breweries: request.breweries,
    styles: request.styles
  }
}

export async function findBeerById (
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  beerId: string,
  log: log
): Promise<BeerWithBreweriesAndStyles> {
  log(INFO, 'find beer with id', beerId)
  const beer = await find(beerId)

  if (beer === undefined) throw beerNotFoundError(beerId)

  return beer
}

export async function listBeers (
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  pagination: Pagination,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  log(INFO, 'list beers', pagination)
  return await list(pagination)
}

export async function searchBeers (
  search: (searchRequest: SearchByName) =>
  Promise<BeerWithBreweriesAndStyles[]>,
  searchRequest: SearchByName,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  log(INFO, 'search beers', searchRequest)
  return await search(searchRequest)
}

async function lockIds (
  lockIds: LockIds,
  keys: string[],
  error: Error
): Promise<void> {
  const lockedIds = await lockIds(keys)
  if (!areKeysEqual(lockedIds, keys)) {
    throw error
  }
}
