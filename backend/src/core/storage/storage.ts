import { ajv } from '../internal/ajv'

import type { Container } from '../container'
import type { LockId } from '../db'
import {
  invalidStorageError,
  invalidStorageIdError
} from '../errors'
import { timePattern } from '../time'

export interface CreateIf {
  insertStorage: (request: CreateStorageRequest) => Promise<StorageWithDate>
  lockBeer: LockId
  lockContainer: LockId
}

export interface UpdateIf {
  updateStorage: (request: Storage) => Promise<StorageWithDate>
  lockBeer: LockId
  lockContainer: LockId
}

export interface Storage {
  id: string
  bestBefore: string
  beer: string
  container: string
}

export interface StorageWithDate {
  id: string
  bestBefore: Date
  beer: string
  container: string
}

export interface JoinedStorage {
  id: string
  beerId: string
  beerName: string
  bestBefore: Date
  breweries: Array<{
    id: string
    name: string
  }>
  container: Container
  createdAt: Date
  hasReview: boolean
  styles: Array<{
    id: string
    name: string
  }>
}

export interface StorageRequest {
  beer: string
  bestBefore: string
  container: string
}

export type CreateStorageRequest = StorageRequest
export type UpdateStorageRequest = StorageRequest

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
