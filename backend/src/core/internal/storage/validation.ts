import { ajv } from '../ajv'

import {
  invalidStorageError,
  invalidStorageIdError
} from '../../errors'
import { timePattern } from '../../internal/time'
import type {
  CreateStorageRequest,
  StorageRequest,
  UpdateStorageRequest
} from '../../storage/storage'

const doValidateStorageRequest =
  ajv.compile<StorageRequest>({
    type: 'object',
    properties: {
      bestBefore: {
        type: 'string',
        pattern: timePattern
      },
      beer: {
        type: 'string',
        minLength: 1
      },
      container: {
        type: 'string',
        minLength: 1
      }
    },
    required: ['beer', 'bestBefore', 'container'],
    additionalProperties: false
  })

function isCreateStorageRequestValid (body: unknown): boolean {
  return doValidateStorageRequest(body)
}

export function isUpdateStorageRequestValid (body: unknown): boolean {
  return doValidateStorageRequest(body)
}

export function validateCreateStorageRequest (
  body: unknown
): CreateStorageRequest {
  if (!isCreateStorageRequestValid(body)) {
    throw invalidStorageError
  }

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as CreateStorageRequest
  return result
}

interface ValidUpdateStorageRequest {
  id: string
  request: UpdateStorageRequest
}

export function validateUpdateStorageRequest (
  body: unknown,
  storageId: string | undefined
): ValidUpdateStorageRequest {
  if (!isUpdateStorageRequestValid(body)) {
    throw invalidStorageError
  }
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Validated using ajv.
   */
  const result = body as UpdateStorageRequest
  return {
    id: validateStorageId(storageId),
    request: result
  }
}

export function validateStorageId(id: string | undefined): string {
  if (typeof id !== 'string' || id.length === 0) {
    throw invalidStorageIdError
  }
  return id
}
