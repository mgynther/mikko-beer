import { ControllerError } from './errors'
import {
  type SearchByName as SearchByNameInternal,
  validateSearchByName as coreValidate
} from '../core/search'

export type SearchByName = SearchByNameInternal

export function validateSearchByName (search: unknown): SearchByName {
  try {
    return coreValidate(search)
  } catch (e) {
    throw new ControllerError(
      400, 'InvalidSearch', 'invalid search'
    )
  }
}
