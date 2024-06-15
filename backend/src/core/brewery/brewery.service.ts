import {
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  type Brewery,
  type NewBrewery
} from './brewery'

import {
  type Pagination
} from '../pagination'
import { type SearchByName } from '../search'

export async function createBrewery (
  create: (brewery: NewBrewery) => Promise<Brewery>,
  request: CreateBreweryRequest
): Promise<Brewery> {
  const brewery = await create({
    name: request.name
  })

  return { ...brewery }
}

export async function updateBrewery (
  update: (brewery: Brewery) => Promise<Brewery>,
  breweryId: string,
  request: UpdateBreweryRequest
): Promise<Brewery> {
  const brewery = await update({
    id: breweryId,
    name: request.name
  })

  return { ...brewery }
}

export async function findBreweryById (
  find: (id: string) => Promise<Brewery | undefined>,
  breweryId: string
): Promise<Brewery | undefined> {
  const brewery = await find(breweryId)

  if (brewery === undefined) return undefined

  return brewery
}

export async function listBreweries (
  list: (pagination: Pagination) => Promise<Brewery[]>,
  pagination: Pagination
): Promise<Brewery[]> {
  return await list(pagination)
}

export async function searchBreweries (
  search: (searchRequest: SearchByName) =>
  Promise<Brewery[]>,
  searchRequest: SearchByName
): Promise<Brewery[]> {
  return await search(searchRequest)
}
