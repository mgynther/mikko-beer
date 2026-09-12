import { ajv } from './internal/ajv.js'

interface BreweryRequest {
  name: string
}

export type CreateBreweryRequest = BreweryRequest
export type UpdateBreweryRequest = BreweryRequest

export interface ValidUpdateBreweryRequest {
  id: string
  request: UpdateBreweryRequest
}

export type CreateBreweryValidationResult =
  | {
      errorCode: 'invalid-brewery'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateBreweryRequest
    }

export type UpdateBreweryValidationResult =
  | {
      errorCode: 'invalid-brewery' | 'invalid-brewery-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateBreweryRequest
    }

export type ValidateBreweryIdResult =
  | {
      errorCode: 'invalid-brewery-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateBreweryRequest = ajv.compile<CreateBreweryRequest>({
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

function isCreateBreweryRequestValid(body: unknown): boolean {
  return doValidateBreweryRequest(body)
}

function isUpdateBreweryRequestValid(body: unknown): boolean {
  return doValidateBreweryRequest(body)
}

export function validateCreateBreweryRequest(
  body: unknown,
): CreateBreweryValidationResult {
  if (!isCreateBreweryRequestValid(body)) {
    return { errorCode: 'invalid-brewery', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateBreweryRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateBreweryRequest(
  body: unknown,
  breweryId: string | undefined,
): UpdateBreweryValidationResult {
  if (!isUpdateBreweryRequestValid(body)) {
    return { errorCode: 'invalid-brewery', result: undefined }
  }
  const validationResult = validateBreweryId(breweryId)
  if (validationResult.errorCode === 'invalid-brewery-id') {
    return { errorCode: 'invalid-brewery-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateBreweryRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateBreweryId(
  id: string | undefined,
): ValidateBreweryIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-brewery-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}
