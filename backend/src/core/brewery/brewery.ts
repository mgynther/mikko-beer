import { ajv } from '../ajv'

export interface Brewery {
  id: string
  name: string
}

export interface NewBrewery {
  name: string
}

export interface CreateBreweryRequest {
  name: string
}

export interface UpdateBreweryRequest {
  name: string
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
  return doValidateBreweryRequest(body)
}

export function validateUpdateBreweryRequest (body: unknown): boolean {
  return doValidateBreweryRequest(body)
}
