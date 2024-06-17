import {
  type CreateBeerRequest,
  type UpdateBeerRequest,
  type Beer,
  type BeerWithBreweryAndStyleIds,
  type BeerWithBreweriesAndStyles,
  type NewBeer
} from './beer'

import {
  type Pagination
} from '../pagination'
import { type SearchByName } from '../search'

type InsertBreweries = (beerId: string, breweries: string[]) => Promise<void>
type InsertStyles = (beerId: string, styles: string[]) => Promise<void>

export interface CreateIf {
  create: (beer: NewBeer) => Promise<Beer>
  insertBeerBreweries: InsertBreweries
  insertBeerStyles: InsertStyles
}

export async function createBeer (
  createIf: CreateIf,
  request: CreateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
  const beer = await createIf.create({
    name: request.name
  })

  await Promise.all([
    createIf.insertBeerBreweries(beer.id, request.breweries),
    createIf.insertBeerStyles(beer.id, request.styles)
  ])

  return {
    id: beer.id,
    name: beer.name,
    breweries: request.breweries,
    styles: request.styles
  }
}

export interface UpdateIf {
  update: (beer: Beer) => Promise<Beer>
  insertBeerBreweries: InsertBreweries
  deleteBeerBreweries: (beerId: string) => Promise<void>
  insertBeerStyles: InsertStyles
  deleteBeerStyles: (beerId: string) => Promise<void>
}

export async function updateBeer (
  updateIf: UpdateIf,
  beerId: string,
  request: UpdateBeerRequest
): Promise<BeerWithBreweryAndStyleIds> {
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

  return {
    id: beerId,
    name: request.name,
    breweries: request.breweries,
    styles: request.styles
  }
}

export async function findBeerById (
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  beerId: string
): Promise<BeerWithBreweriesAndStyles | undefined> {
  const beer = await find(beerId)

  if (beer === undefined) return undefined

  return beer
}

export async function listBeers (
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  pagination: Pagination
): Promise<BeerWithBreweriesAndStyles[]> {
  return await list(pagination)
}

export async function searchBeers (
  search: (searchRequest: SearchByName) =>
  Promise<BeerWithBreweriesAndStyles[]>,
  searchRequest: SearchByName
): Promise<BeerWithBreweriesAndStyles[]> {
  return await search(searchRequest)
}