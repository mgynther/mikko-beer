import { ajv } from './internal/ajv.js'
import { timePattern } from './internal/time.js'

export interface StorageRequest {
  beer: string
  bestBefore: string
  container: string
}

export type CreateStorageRequest = StorageRequest
export type UpdateStorageRequest = StorageRequest

export interface ValidUpdateStorageRequest {
  id: string
  request: UpdateStorageRequest
}

export type CreateStorageValidationResult =
  | {
      errorCode: 'invalid-storage'
      result: undefined
    }
  | {
      errorCode: undefined
      result: CreateStorageRequest
    }

export type UpdateStorageValidationResult =
  | {
      errorCode: 'invalid-storage' | 'invalid-storage-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: ValidUpdateStorageRequest
    }

export type ValidateStorageIdResult =
  | {
      errorCode: 'invalid-storage-id'
      result: undefined
    }
  | {
      errorCode: undefined
      result: string
    }

const doValidateStorageRequest = ajv.compile<StorageRequest>({
  type: 'object',
  properties: {
    bestBefore: {
      type: 'string',
      pattern: timePattern,
    },
    beer: {
      type: 'string',
      minLength: 1,
    },
    container: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['beer', 'bestBefore', 'container'],
  additionalProperties: false,
})

function isCreateStorageRequestValid(body: unknown): boolean {
  return doValidateStorageRequest(body)
}

function isUpdateStorageRequestValid(body: unknown): boolean {
  return doValidateStorageRequest(body)
}

export function validateCreateStorageRequest(
  body: unknown,
): CreateStorageValidationResult {
  if (!isCreateStorageRequestValid(body)) {
    return { errorCode: 'invalid-storage', result: undefined }
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateStorageRequest
  return {
    errorCode: undefined,
    result,
  }
}

export function validateUpdateStorageRequest(
  body: unknown,
  storageId: string | undefined,
): UpdateStorageValidationResult {
  if (!isUpdateStorageRequestValid(body)) {
    return { errorCode: 'invalid-storage', result: undefined }
  }
  const validationResult = validateStorageId(storageId)
  if (validationResult.errorCode === 'invalid-storage-id') {
    return { errorCode: 'invalid-storage-id', result: undefined }
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateStorageRequest
  return {
    errorCode: undefined,
    result: {
      id: validationResult.result,
      request: result,
    },
  }
}

export function validateStorageId(
  id: string | undefined,
): ValidateStorageIdResult {
  if (id === undefined || id.length === 0) {
    return { errorCode: 'invalid-storage-id', result: undefined }
  }
  return { errorCode: undefined, result: id }
}
