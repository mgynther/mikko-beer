import { ajv } from '../util/ajv'

import { type Container } from '../container/container'

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
        // eslint-disable-next-line max-len
        pattern: '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d.\\d+([+-][0-2]\\d:[0-5]\\d|Z)$'
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
  return doValidateStorageRequest(body) as boolean
}

export function validateUpdateStorageRequest (body: unknown): boolean {
  return doValidateStorageRequest(body) as boolean
}
