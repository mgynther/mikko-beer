import { ajv } from '../ajv'

import {
  invalidBreweryError,
  invalidBreweryIdError
} from '../errors'

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

function isCreateBreweryRequestValid (body: unknown): boolean {
  return doValidateBreweryRequest(body)
}

function isUpdateBreweryRequestValid (body: unknown): boolean {
  return doValidateBreweryRequest(body)
}

export function validateCreateBreweryRequest (
  body: unknown
): CreateBreweryRequest {
  if (!isCreateBreweryRequestValid(body)) {
    throw invalidBreweryError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateBreweryRequest
  return result
}

export function validateUpdateBreweryRequest (
  body: unknown,
  breweryId: string
): UpdateBreweryRequest {
  if (!isUpdateBreweryRequestValid(body)) {
    throw invalidBreweryError
  }
  if (typeof breweryId !== 'string' || breweryId.length === 0) {
    throw invalidBreweryIdError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateBreweryRequest
  return result
}
