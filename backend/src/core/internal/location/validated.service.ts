import * as locationService from './service'

import {
  validateLocationId,
  validateCreateLocationRequest,
  validateUpdateLocationRequest
} from "./validation";
import type { Location, CreateLocationRequest } from "../../location/location"
import type { log } from '../../log'
import type { Pagination } from '../../pagination'
import type { SearchByName } from '../../search'
import { validateSearchByName } from '../../search'

export async function createLocation (
  create: (location: CreateLocationRequest) => Promise<Location>,
  body: unknown,
  log: log
): Promise<Location> {
  const createRequest = validateCreateLocationRequest(body)
  return await locationService.createLocation(create, createRequest, log)
}

export async function updateLocation (
  update: (location: Location) => Promise<Location>,
  locationId: string | undefined,
  body: unknown,
  log: log
): Promise<Location> {
  const validRequest = validateUpdateLocationRequest(body, locationId)
  return await locationService.updateLocation(
    update,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findLocationById (
  find: (id: string) => Promise<Location | undefined>,
  id: string | undefined,
  log: log
): Promise<Location> {
  return await locationService.findLocationById(
    find,
    validateLocationId(id),
    log
  )
}

export async function listLocations (
  list: (pagination: Pagination) => Promise<Location[]>,
  pagination: Pagination,
  log: log
): Promise<Location[]> {
  return await locationService.listLocations(list, pagination, log)
}

export async function searchLocations (
  search: (searchRequest: SearchByName) =>
  Promise<Location[]>,
  body: unknown,
  log: log
): Promise<Location[]> {
  const validRequest = validateSearchByName(body)
  return await locationService.searchLocations(search, validRequest, log)
}
