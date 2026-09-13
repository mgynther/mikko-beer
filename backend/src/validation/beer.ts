import { ajv } from './internal/ajv.js'

export interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

export type CreateBeerRequest = BeerRequest
export type UpdateBeerRequest = BeerRequest

export interface ValidUpdateBeerRequest {
  id: string
  request: UpdateBeerRequest
}

export type CreateBeerValidationResult =
  | {
      errorCode: 'invalid-beer'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateBeerRequest
    }

export type UpdateBeerValidationResult =
  | {
      errorCode: 'invalid-beer' | 'invalid-beer-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateBeerRequest
    }

export type ValidateBeerIdResult =
  | {
      errorCode: 'invalid-beer-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateBeerRequest = ajv.compile<BeerRequest>({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    breweries: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
    styles: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
  },
  required: ['name', 'breweries', 'styles'],
  additionalProperties: false,
})

function isCreateBeerRequestValid(body: unknown): boolean {
  return doValidateBeerRequest(body)
}

function isUpdateBeerRequestValid(body: unknown): boolean {
  return doValidateBeerRequest(body)
}

export function validateCreateBeerRequest(
  body: unknown,
): CreateBeerValidationResult {
  if (!isCreateBeerRequestValid(body)) {
    return { errorCode: 'invalid-beer', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateBeerRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateBeerRequest(
  body: unknown,
  beerId: string | undefined,
): UpdateBeerValidationResult {
  if (!isUpdateBeerRequestValid(body)) {
    return { errorCode: 'invalid-beer', result: undefined }
  }
  const validationResult = validateBeerId(beerId)
  if (validationResult.errorCode === 'invalid-beer-id') {
    return { errorCode: 'invalid-beer-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateBeerRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateBeerId(id: string | undefined): ValidateBeerIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-beer-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}
