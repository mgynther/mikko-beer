import { ajv } from '../util/ajv'

export interface Brewery {
  id: string
  name: string | null
}

export interface CreateBreweryRequest {
  name?: string
}

export const validateCreateBreweryRequest =
  ajv.compile<CreateBreweryRequest>({
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
    },
  })
