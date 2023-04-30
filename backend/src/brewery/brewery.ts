import { ajv } from '../util/ajv'

export interface Brewery {
  id: string
  name: string | null
}

export interface CreateBreweryRequest {
  name?: string
}

export interface SearchBreweryRequest {
  name?: string
}

export interface UpdateBreweryRequest {
  name?: string
}

const doValidateBreweryRequest =
  ajv.compile<CreateBreweryRequest>({
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1
      }
    },
    required: ['name'],
    additionalProperties: false
  })

export function validateCreateBreweryRequest (body: unknown): boolean {
  return doValidateBreweryRequest(body) as boolean
}

export function validateSearchBreweryRequest (body: unknown): boolean {
  return doValidateBreweryRequest(body) as boolean
}

export function validateUpdateBreweryRequest (body: unknown): boolean {
  return doValidateBreweryRequest(body) as boolean
}
