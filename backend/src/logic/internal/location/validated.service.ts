import * as locationService from './service.js'

import type {
  Location,
  CreateLocationRequest,
  ValidateCreateLocation,
  ValidateLocationId,
  ValidateUpdateLocation,
} from '../../location/location.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { SearchByName } from '../../search.js'
import { validateSearchByName } from '../../search.js'
import { invalidLocationError, invalidLocationIdError } from '../../errors.js'

export async function createLocation(
  create: (location: CreateLocationRequest) => Promise<Location>,
  validate: ValidateCreateLocation,
  body: unknown,
  log: log,
): Promise<Location> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-location') {
    throw invalidLocationError
  }
  return await locationService.createLocation(
    create,
    validationResult.result,
    log,
  )
}

export async function updateLocation(
  update: (location: Location) => Promise<Location>,
  validate: ValidateUpdateLocation,
  locationId: string | undefined,
  body: unknown,
  log: log,
): Promise<Location> {
  const validationResult = validate(body, locationId)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-location':
        throw invalidLocationError
      case 'invalid-location-id':
        throw invalidLocationIdError
    }
  }
  return await locationService.updateLocation(
    update,
    validationResult.result.id,
    validationResult.result.request,
    log,
  )
}

export async function findLocationById(
  find: (id: string) => Promise<Location | undefined>,
  validateLocationId: ValidateLocationId,
  id: string | undefined,
  log: log,
): Promise<Location> {
  const idResult = validateLocationId(id)
  if (idResult.errorCode === 'invalid-location-id') {
    throw invalidLocationIdError
  }
  return await locationService.findLocationById(find, idResult.result, log)
}

export async function listLocations(
  list: (pagination: Pagination) => Promise<Location[]>,
  pagination: Pagination,
  log: log,
): Promise<Location[]> {
  return await locationService.listLocations(list, pagination, log)
}

export async function searchLocations(
  search: (searchRequest: SearchByName) => Promise<Location[]>,
  body: unknown,
  log: log,
): Promise<Location[]> {
  const validRequest = validateSearchByName(body)
  return await locationService.searchLocations(search, validRequest, log)
}
