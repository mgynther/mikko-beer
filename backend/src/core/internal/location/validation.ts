import { ajv } from '../ajv'

import {
  invalidLocationError,
  invalidLocationIdError
} from '../../errors'
import type {
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../location/location'

const doValidateLocationRequest =
  ajv.compile<CreateLocationRequest>({
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

function isCreateLocationRequestValid (body: unknown): boolean {
  return doValidateLocationRequest(body)
}

function isUpdateLocationRequestValid (body: unknown): boolean {
  return doValidateLocationRequest(body)
}

export function validateCreateLocationRequest (
  body: unknown
): CreateLocationRequest {
  if (!isCreateLocationRequestValid(body)) {
    throw invalidLocationError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateLocationRequest
  return result
}

interface ValidUpdateLocationRequest {
  request: UpdateLocationRequest
  id: string
}

export function validateUpdateLocationRequest (
  body: unknown,
  locationId: string | undefined
): ValidUpdateLocationRequest {
  if (!isUpdateLocationRequestValid(body)) {
    throw invalidLocationError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateLocationRequest
  return {
    id: validateLocationId(locationId),
    request: result
  }
}

export function validateLocationId (id: string | undefined): string {
  if (typeof id !== 'string' || id.length === 0) {
    throw invalidLocationIdError
  }
  return id
}
