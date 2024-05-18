import { ajv } from '../ajv'

import { type Container } from '../container/container'
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
  beerName: string | null
  bestBefore: Date
  breweries: Array<{
    id: string
    name: string | null
  }>
  container: Container
  styles: Array<{
    id: string
    name: string | null
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

export function validateCreateStorageRequest (body: unknown): boolean {
  return doValidateStorageRequest(body)
}

export function validateUpdateStorageRequest (body: unknown): boolean {
  return doValidateStorageRequest(body)
}
