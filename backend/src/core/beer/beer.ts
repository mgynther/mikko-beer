import type { Brewery } from '../brewery/brewery'
import type { Style } from '../style/style'
import type { LockIds } from '../db'

export interface NewBeer {
  name: string
}

export interface Beer {
  id: string
  name: string
}

type InsertBreweries = (beerId: string, breweries: string[]) => Promise<void>
type InsertStyles = (beerId: string, styles: string[]) => Promise<void>

export interface CreateIf {
  create: (beer: NewBeer) => Promise<Beer>
  lockBreweries: LockIds
  lockStyles: LockIds
  insertBeerBreweries: InsertBreweries
  insertBeerStyles: InsertStyles
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

export interface BeerWithBreweryAndStyleIds {
  id: string
  name: string | null
  breweries: string[]
  styles: string[]
}

export interface BeerWithBreweriesAndStyles {
  id: string
  name: string
  breweries: Brewery[]
  styles: Style[]
}

export interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

export type CreateBeerRequest = BeerRequest
export type UpdateBeerRequest = BeerRequest
