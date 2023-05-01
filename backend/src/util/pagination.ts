import { ajv } from './ajv'
import { ControllerError } from './errors'

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

export function validatePagination (pagination: PaginationRequest): Pagination {
  if (pagination.size === undefined && pagination.skip === undefined) {
    return { size: 10000, skip: 0 }
  }
  function error (): ControllerError {
    return new ControllerError(400, 'InvalidPagination', 'invalid pagination')
  }
  if (typeof pagination.size !== 'string' ||
      typeof pagination.skip !== 'string') {
    throw error()
  }
  const parsed = {
    size: parseInt(pagination.size),
    skip: parseInt(pagination.skip)
  }
  const isValid = doValidatePagination(parsed) as boolean
  if (!isValid) {
    throw error()
  }
  return parsed
}
