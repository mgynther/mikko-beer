import { ajv } from './internal/ajv.js'

interface LocationRequest {
  name: string
}

export type CreateLocationRequest = LocationRequest
export type UpdateLocationRequest = LocationRequest

export interface ValidUpdateLocationRequest {
  id: string
  request: UpdateLocationRequest
}

export type CreateLocationValidationResult =
  | {
      errorCode: 'invalid-location'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateLocationRequest
    }

export type UpdateLocationValidationResult =
  | {
      errorCode: 'invalid-location' | 'invalid-location-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateLocationRequest
    }

export type ValidateLocationIdResult =
  | {
      errorCode: 'invalid-location-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateLocationRequest = ajv.compile<CreateLocationRequest>({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['name'],
  additionalProperties: false,
})

function isCreateLocationRequestValid(body: unknown): boolean {
  return doValidateLocationRequest(body)
}

function isUpdateLocationRequestValid(body: unknown): boolean {
  return doValidateLocationRequest(body)
}

export function validateCreateLocationRequest(
  body: unknown,
): CreateLocationValidationResult {
  if (!isCreateLocationRequestValid(body)) {
    return { errorCode: 'invalid-location', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateLocationRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateLocationRequest(
  body: unknown,
  locationId: string | undefined,
): UpdateLocationValidationResult {
  if (!isUpdateLocationRequestValid(body)) {
    return { errorCode: 'invalid-location', result: undefined }
  }
  const validationResult = validateLocationId(locationId)
  if (validationResult.errorCode === 'invalid-location-id') {
    return { errorCode: 'invalid-location-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateLocationRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateLocationId(
  id: string | undefined,
): ValidateLocationIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-location-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}
