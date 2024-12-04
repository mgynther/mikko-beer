import { ajv } from '../ajv'

import {
  invalidBeerError,
  invalidBeerIdError
} from '../errors'

import type { Brewery } from '../brewery/brewery'
import type { Style } from '../style/style'

export interface NewBeer {
  name: string
}

export interface Beer {
  id: string
  name: string
}

export type LockIds = (ids: string[]) => Promise<string[]>
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

const doValidateBeerRequest =
  ajv.compile<BeerRequest>({
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1
      },
      breweries: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1
      },
      styles: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1
      }

    },
    required: ['name', 'breweries', 'styles'],
    additionalProperties: false
  })

function isCreateBeerRequestValid (body: unknown): boolean {
  return doValidateBeerRequest(body)
}

export function isUpdateBeerRequestValid (body: unknown): boolean {
  return doValidateBeerRequest(body)
}

export function validateCreateBeerRequest (body: unknown): CreateBeerRequest {
  if (!isCreateBeerRequestValid(body)) {
    throw invalidBeerError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateBeerRequest
  return result
}

export function validateUpdateBeerRequest (
  body: unknown,
  beerId: string
): UpdateBeerRequest {
  if (!isUpdateBeerRequestValid(body)) {
    throw invalidBeerError
  }
  if (typeof beerId !== 'string' || beerId.length === 0) {
    throw invalidBeerIdError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateBeerRequest
  return result
}
