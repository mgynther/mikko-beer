import { ajv } from './internal/ajv.js'

import { invalidPaginationError } from './errors.js'

export interface Pagination {
  size: number
  skip: number
}

export interface PaginationRequest {
  size: string | string[] | undefined
  skip: string | string[] | undefined
}

const doValidatePagination = ajv.compile<PaginationRequest>({
  type: 'object',
  properties: {
    size: {
      type: 'integer',
      maximum: 10000,
      minimum: 1,
    },
    skip: {
      type: 'integer',
      minimum: 0,
    },
  },
  required: ['size', 'skip'],
  additionalProperties: false,
})

export function validatePagination(pagination: PaginationRequest): Pagination {
  if (pagination.size === undefined && pagination.skip === undefined) {
    return { size: 10000, skip: 0 }
  }
  if (
    typeof pagination.size !== 'string' ||
    typeof pagination.skip !== 'string'
  ) {
    throw invalidPaginationError
  }
  const regex = /^[0-9]+$/v
  if (!regex.test(pagination.size) || !regex.test(pagination.skip)) {
    throw invalidPaginationError
  }
  const parsed = {
    size: parseInt(pagination.size, 10),
    skip: parseInt(pagination.skip, 10),
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

export function toRowNumbers(pagination: Pagination): RowNumbers {
  const start = pagination.skip + 1
  const end = pagination.skip + pagination.size
  return { start, end }
}
