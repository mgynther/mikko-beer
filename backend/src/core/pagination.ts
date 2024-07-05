import { ajv } from './ajv'

import { invalidPaginationError } from './errors'

export interface Pagination {
  size: number
  skip: number
}

export interface PaginationRequest {
  size: string | string[] | undefined
  skip: string | string[] | undefined
}

const doValidatePagination =
  ajv.compile<PaginationRequest>({
    type: 'object',
    properties: {
      size: {
        type: 'integer',
        maximum: 10000,
        minimum: 1
      },
      skip: {
        type: 'integer',
        minimum: 0
      }
    },
    required: ['size', 'skip'],
    additionalProperties: false
  })

export class PaginationError extends Error { }

export function validatePagination (pagination: PaginationRequest): Pagination {
  if (pagination.size === undefined && pagination.skip === undefined) {
    return { size: 10000, skip: 0 }
  }
  if (typeof pagination.size !== 'string' ||
      typeof pagination.skip !== 'string') {
    throw invalidPaginationError
  }
  const regex = /^[0-9]+$/
  if (!regex.test(pagination.size) || !regex.test(pagination.skip)) {
    throw invalidPaginationError
  }
  const parsed = {
    size: parseInt(pagination.size),
    skip: parseInt(pagination.skip)
  }
  const isValid = doValidatePagination(parsed)
  if (!isValid) {
    throw invalidPaginationError
  }
  return parsed
}

interface RowNumbers {
  start: number
  end: number
}

export function toRowNumbers (pagination: Pagination): RowNumbers {
  // Regardless of TypeScript checking validate runtime type of parameters that
  // will be used in raw SQL just to be sure injections are impossible even in
  // case of wrong type assertions and other bad practices.
  if (typeof pagination.size !== 'number') {
    throw new Error('must not get any other type than number in size')
  }
  if (typeof pagination.skip !== 'number') {
    throw new Error('must not get any other type than number in skip')
  }
  const start = pagination.skip + 1
  const end = pagination.skip + pagination.size
  return { start, end }
}
