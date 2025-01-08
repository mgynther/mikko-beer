import type {
  CreateLocationRequest,
  UpdateLocationRequest,
  Location
} from '../../location/location'

import { locationNotFoundError } from '../../errors'
import type { log } from '../../log'
import { INFO } from '../../log'
import type {
  Pagination
} from '../../pagination'
import type { SearchByName } from '../../search'

export async function createLocation (
  create: (location: CreateLocationRequest) => Promise<Location>,
  request: CreateLocationRequest,
  log: log
): Promise<Location> {
  log(INFO, 'create location with name', request.name)
  const location = await create({
    name: request.name
  })

  log(INFO, 'created location with name', location.name, 'and id', location.id)
  return { ...location }
}

export async function updateLocation (
  update: (location: Location) => Promise<Location>,
  locationId: string,
  request: UpdateLocationRequest,
  log: log
): Promise<Location> {
  log(INFO, 'update location with id', locationId)
  const location = await update({
    id: locationId,
    name: request.name
  })

  log(INFO, 'updated location with id', locationId)
  return { ...location }
}

export async function findLocationById (
  find: (id: string) => Promise<Location | undefined>,
  locationId: string,
  log: log
): Promise<Location> {
  log(INFO, 'find location with id', locationId)
  const location = await find(locationId)

  if (location === undefined) throw locationNotFoundError(locationId)

  return location
}

export async function listLocations (
  list: (pagination: Pagination) => Promise<Location[]>,
  pagination: Pagination,
  log: log
): Promise<Location[]> {
  log(INFO, 'list locations', pagination)
  return await list(pagination)
}

export async function searchLocations (
  search: (searchRequest: SearchByName) =>
  Promise<Location[]>,
  searchRequest: SearchByName,
  log: log
): Promise<Location[]> {
  log(INFO, 'search locations', searchRequest)
  return await search(searchRequest)
}
