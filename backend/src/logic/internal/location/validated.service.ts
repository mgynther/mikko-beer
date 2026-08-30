import * as locationService from './service.js'

import {
  validateLocationId,
  validateCreateLocationRequest,
  validateUpdateLocationRequest,
} from './validation.js'
import type {
  Location,
  CreateLocationRequest,
} from '../../location/location.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { SearchByName } from '../../search.js'
import { validateSearchByName } from '../../search.js'

export async function createLocation(
  create: (location: CreateLocationRequest) => Promise<Location>,
  body: unknown,
  log: log,
): Promise<Location> {
  const createRequest = validateCreateLocationRequest(body)
  return await locationService.createLocation(create, createRequest, log)
}

export async function updateLocation(
  update: (location: Location) => Promise<Location>,
  locationId: string | undefined,
  body: unknown,
  log: log,
): Promise<Location> {
  const validRequest = validateUpdateLocationRequest(body, locationId)
  return await locationService.updateLocation(
    update,
    validRequest.id,
    validRequest.request,
    log,
  )
}

export async function findLocationById(
  find: (id: string) => Promise<Location | undefined>,
  id: string | undefined,
  log: log,
): Promise<Location> {
  return await locationService.findLocationById(
    find,
    validateLocationId(id),
    log,
  )
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
