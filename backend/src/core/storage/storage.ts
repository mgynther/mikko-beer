import { ajv } from '../ajv'

import { type Container } from '../container/container'
import {
  invalidStorageError,
  invalidStorageIdError
} from '../errors'
import { timePattern } from '../time'

export interface Storage {
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
  styles: Array<{
    id: string
    name: string
  }>
}

export interface StorageRequest {
  beer: string
  bestBefore: Date
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

  const result = body as CreateStorageRequest
  return result
}

export function validateUpdateStorageRequest (
  body: unknown,
  storageId: string
): UpdateStorageRequest {
  if (!isUpdateStorageRequestValid(body)) {
    throw invalidStorageError
  }
  if (typeof storageId !== 'string' || storageId.length === 0) {
    throw invalidStorageIdError
  }

  const result = body as UpdateStorageRequest
  return result
}
