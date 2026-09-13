import { ajv } from './internal/ajv.js'

export interface Pagination {
  size: number
  skip: number
}

export interface PaginationRequest {
  size: string | string[] | undefined
  skip: string | string[] | undefined
}

export type PaginationValidationResult =
  | {
      errorCode: 'invalid-pagination'
      result: undefined
    }
  | {
      errorCode: undefined
      result: Pagination
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

export function validatePagination(
  pagination: PaginationRequest,
): PaginationValidationResult {
  if (pagination.size === undefined && pagination.skip === undefined) {
    return { errorCode: undefined, result: { size: 10000, skip: 0 } }
  }
  if (
    typeof pagination.size !== 'string' ||
    typeof pagination.skip !== 'string'
  ) {
    return { errorCode: 'invalid-pagination', result: undefined }
  }
  const regex = /^[0-9]+$/v
  if (!regex.test(pagination.size) || !regex.test(pagination.skip)) {
    return { errorCode: 'invalid-pagination', result: undefined }
  }
  const parsed = {
    size: parseInt(pagination.size, 10),
    skip: parseInt(pagination.skip, 10),
  }
  const isValid = doValidatePagination(parsed)
  if (!isValid) {
    return { errorCode: 'invalid-pagination', result: undefined }
  }
  return { errorCode: undefined, result: parsed }
}
