import type { Style } from '../style/style.js'
import type { LockIds } from '../db.js'

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
  name: string
  breweries: string[]
  styles: string[]
}

export interface BeerWithBreweriesAndStyles {
  id: string
  name: string
  breweries: Array<{
    id: string
    name: string
  }>
  styles: Style[]
}

export interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

export type CreateBeerRequest = BeerRequest
export type UpdateBeerRequest = BeerRequest

export interface ValidUpdateBeerRequest {
  id: string
  request: UpdateBeerRequest
}

export type CreateBeerValidationResult =
  | {
      errorCode: 'invalid-beer'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateBeerRequest
    }

export type ValidateCreateBeer = (body: unknown) => CreateBeerValidationResult

export type UpdateBeerValidationResult =
  | {
      errorCode: 'invalid-beer' | 'invalid-beer-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateBeerRequest
    }

export type ValidateUpdateBeer = (
  body: unknown,
  id: string | undefined,
) => UpdateBeerValidationResult

export type ValidateBeerIdResult =
  | {
      errorCode: 'invalid-beer-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

export type ValidateBeerId = (id: string | undefined) => ValidateBeerIdResult
