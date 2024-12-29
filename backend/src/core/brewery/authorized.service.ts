import * as authorizationService from '../internal/auth/authorization.service'
import * as breweryService from '../internal/brewery/validated.service'

import type {
  BodyRequest,
  IdRequest,
  PaginationRequest
} from "../request"
import type { Brewery, NewBrewery } from "../brewery/brewery"
import type { log } from '../log'
import type { Pagination } from '../pagination'
import type { SearchByName } from '../search'

export async function createBrewery (
  create: (brewery: NewBrewery) => Promise<Brewery>,
  request: BodyRequest,
  log: log
): Promise<Brewery> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await breweryService.createBrewery(create, request.body, log)
}

export async function updateBrewery (
  update: (brewery: Brewery) => Promise<Brewery>,
  breweryId: string | undefined,
  request: BodyRequest,
  log: log
): Promise<Brewery> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await breweryService.updateBrewery(
    update,
    breweryId,
    request.body,
    log
  )
}

export async function findBreweryById (
  find: (id: string) => Promise<Brewery | undefined>,
  request: IdRequest,
  log: log
): Promise<Brewery> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await breweryService.findBreweryById(
    find,
    request.id,
    log
  )
}

export async function listBreweries (
  list: (pagination: Pagination) => Promise<Brewery[]>,
  request: PaginationRequest,
  log: log
): Promise<Brewery[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await breweryService.listBreweries(list, request.pagination, log)
}

export async function searchBreweries (
  search: (searchRequest: SearchByName) =>
  Promise<Brewery[]>,
  request: BodyRequest,
  log: log
): Promise<Brewery[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await breweryService.searchBreweries(search, request.body, log)
}
