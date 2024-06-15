import { ControllerError } from '../core/errors'
import {
  type Pagination,
  type PaginationRequest,
  validatePagination as coreValidate
} from '../core/pagination'

export function validatePagination (pagination: PaginationRequest): Pagination {
  try {
    return coreValidate(pagination)
  } catch (e) {
    throw new ControllerError(400, 'InvalidPagination', 'invalid pagination')
  }
}
