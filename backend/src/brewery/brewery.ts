import { ajv } from '../util/ajv'

export interface Brewery {
  id: string
  name: string | null
}

export interface CreateBreweryRequest {
  name?: string
}

const doValidateCreateBreweryRequest =
  ajv.compile<CreateBreweryRequest>({
    type: 'object',
    properties: {
      name: {
        type: 'string'
      }
    },
    required: ['name'],
    additionalProperties: false
  })

export function validateCreateBreweryRequest (body: unknown): boolean {
  return doValidateCreateBreweryRequest(body) as boolean
}
