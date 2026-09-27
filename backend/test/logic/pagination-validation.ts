import type {
  Pagination,
  ValidatePagination,
} from '../../src/logic/pagination.js'

export function passPaginationValidation(
  pagination: Pagination,
): ValidatePagination {
  return () => ({ errorCode: undefined, result: pagination })
}

export const failPaginationValidation: ValidatePagination = () => ({
  errorCode: 'invalid-pagination',
  result: undefined,
})
