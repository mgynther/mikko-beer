import { ajv } from '../ajv'

import {
  invalidBreweryError,
  invalidBreweryIdError
} from '../../errors'
import type {
  CreateBreweryRequest,
  UpdateBreweryRequest
} from '../../brewery/brewery'

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

interface ValidUpdateBreweryRequest {
  request: UpdateBreweryRequest
  id: string
}

export function validateUpdateBreweryRequest (
  body: unknown,
  breweryId: string | undefined
): ValidUpdateBreweryRequest {
  if (!isUpdateBreweryRequestValid(body)) {
    throw invalidBreweryError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateBreweryRequest
  return {
    id: validateBreweryId(breweryId),
    request: result
  }
}

export function validateBreweryId (id: string | undefined): string {
  if (typeof id !== 'string' || id.length === 0) {
    throw invalidBreweryIdError
  }
  return id
}
