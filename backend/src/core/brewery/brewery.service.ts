import {
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  type Brewery,
  type NewBrewery
} from './brewery'

import { breweryNotFoundError } from '../errors'
import { INFO, type log } from '../log'
import {
  type Pagination
} from '../pagination'
import { type SearchByName } from '../search'

export async function createBrewery (
  create: (brewery: NewBrewery) => Promise<Brewery>,
  request: CreateBreweryRequest,
  log: log
): Promise<Brewery> {
  log(INFO, 'create brewery with name', request.name)
  const brewery = await create({
    name: request.name
  })

  log(INFO, 'created brewery with name', brewery.name, 'and id', brewery.id)
  return { ...brewery }
}

export async function updateBrewery (
  update: (brewery: Brewery) => Promise<Brewery>,
  breweryId: string,
  request: UpdateBreweryRequest,
  log: log
): Promise<Brewery> {
  log(INFO, 'update brewery with id', breweryId)
  const brewery = await update({
    id: breweryId,
    name: request.name
  })

  log(INFO, 'updated brewery with id', breweryId)
  return { ...brewery }
}

export async function findBreweryById (
  find: (id: string) => Promise<Brewery | undefined>,
  breweryId: string,
  log: log
): Promise<Brewery> {
  log(INFO, 'find brewery with id', breweryId)
  const brewery = await find(breweryId)

  if (brewery === undefined) throw breweryNotFoundError(breweryId)

  return brewery
}

export async function listBreweries (
  list: (pagination: Pagination) => Promise<Brewery[]>,
  pagination: Pagination,
  log: log
): Promise<Brewery[]> {
  log(INFO, 'list breweries', pagination)
  return await list(pagination)
}

export async function searchBreweries (
  search: (searchRequest: SearchByName) =>
  Promise<Brewery[]>,
  searchRequest: SearchByName,
  log: log
): Promise<Brewery[]> {
  log(INFO, 'search breweries', searchRequest)
  return await search(searchRequest)
}
