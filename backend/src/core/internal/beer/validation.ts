import { ajv } from '../ajv'

import {
  invalidBeerError,
  invalidBeerIdError
} from '../../errors'

import type {
  BeerRequest,
  CreateBeerRequest,
  UpdateBeerRequest
} from '../../beer/beer'

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

function isUpdateBeerRequestValid (body: unknown): boolean {
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

interface ValidUpdateBeerRequest {
  request: UpdateBeerRequest
  id: string
}

export function validateUpdateBeerRequest (
  body: unknown,
  beerId: string | undefined
): ValidUpdateBeerRequest {
  if (!isUpdateBeerRequestValid(body)) {
    throw invalidBeerError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateBeerRequest
  return {
    id: validateBeerId(beerId),
    request: result
  }
}

export function validateBeerId (id: string | undefined): string {
  if (typeof id !== 'string' || id.length === 0) {
    throw invalidBeerIdError
  }
  return id
}
