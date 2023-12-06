import { ajv } from '../ajv'

import { type Brewery } from '../brewery/brewery'
import { type Style } from '../style/style'

export interface Beer {
  id: string
  name: string | null
}

export interface BeerWithBreweryAndStyleIds {
  id: string
  name: string | null
  breweries: string[]
  styles: string[]
}

export interface BeerWithBreweriesAndStyles {
  id: string
  name: string | null
  breweries: Brewery[]
  styles: Style[]
}

export interface BeerRequest {
  name?: string
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

export function validateCreateBeerRequest (body: unknown): boolean {
  return doValidateBeerRequest(body) as boolean
}

export function validateUpdateBeerRequest (body: unknown): boolean {
  return doValidateBeerRequest(body) as boolean
}
