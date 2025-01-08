import * as authorizationService from '../internal/auth/authorization.service'
import * as locationService from '../internal/location/validated.service'

import type {
  BodyRequest,
  IdRequest,
  PaginationRequest
} from "../request"
import type { Location, CreateLocationRequest } from "../location/location"
import type { log } from '../log'
import type { Pagination } from '../pagination'
import type { SearchByName } from '../search'

export async function createLocation (
  create: (location: CreateLocationRequest) => Promise<Location>,
  request: BodyRequest,
  log: log
): Promise<Location> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await locationService.createLocation(create, request.body, log)
}

export async function updateLocation (
  update: (location: Location) => Promise<Location>,
  locationId: string | undefined,
  request: BodyRequest,
  log: log
): Promise<Location> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await locationService.updateLocation(
    update,
    locationId,
    request.body,
    log
  )
}

export async function findLocationById (
  find: (id: string) => Promise<Location | undefined>,
  request: IdRequest,
  log: log
): Promise<Location> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await locationService.findLocationById(
    find,
    request.id,
    log
  )
}

export async function listLocations (
  list: (pagination: Pagination) => Promise<Location[]>,
  request: PaginationRequest,
  log: log
): Promise<Location[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await locationService.listLocations(list, request.pagination, log)
}

export async function searchLocations (
  search: (searchRequest: SearchByName) =>
  Promise<Location[]>,
  request: BodyRequest,
  log: log
): Promise<Location[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await locationService.searchLocations(search, request.body, log)
}
