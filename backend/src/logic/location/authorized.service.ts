import * as authorizationService from '../internal/auth/authorization.service.js'
import * as locationService from '../internal/location/validated.service.js'

import type { BodyRequest, IdRequest, PaginationRequest } from '../request'
import type {
  Location,
  CreateLocationRequest,
  ValidateCreateLocation,
  ValidateLocationId,
  ValidateUpdateLocation,
  LocationList,
} from '../location/location'
import type { log } from '../log.js'
import type { Pagination, ValidatePagination } from '../pagination.js'
import type { SearchByName, ValidateSearchByName } from '../search.js'

export async function createLocation(
  create: (location: CreateLocationRequest) => Promise<Location>,
  validate: ValidateCreateLocation,
  request: BodyRequest,
  log: log,
): Promise<Location> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await locationService.createLocation(
    create,
    validate,
    request.body,
    log,
  )
}

export async function updateLocation(
  update: (location: Location) => Promise<Location | undefined>,
  validate: ValidateUpdateLocation,
  locationId: string | undefined,
  request: BodyRequest,
  log: log,
): Promise<Location> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await locationService.updateLocation(
    update,
    validate,
    locationId,
    request.body,
    log,
  )
}

export async function findLocationById(
  find: (id: string) => Promise<Location | undefined>,
  validateId: ValidateLocationId,
  request: IdRequest,
  log: log,
): Promise<Location> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await locationService.findLocationById(
    find,
    validateId,
    request.id,
    log,
  )
}

export async function listLocations(
  list: (pagination: Pagination) => Promise<Location[]>,
  validatePagination: ValidatePagination,
  request: PaginationRequest,
  log: log,
): Promise<LocationList> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await locationService.listLocations(
    list,
    validatePagination,
    request.pagination,
    log,
  )
}

export async function searchLocations(
  search: (searchRequest: SearchByName) => Promise<Location[]>,
  validate: ValidateSearchByName,
  request: BodyRequest,
  log: log,
): Promise<Location[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await locationService.searchLocations(
    search,
    validate,
    request.body,
    log,
  )
}
