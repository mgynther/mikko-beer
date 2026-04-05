import * as authorizationService from '../internal/auth/authorization.service.js'
import * as beerService from '../internal/beer/validated.service.js'

import type {
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  UpdateIf
} from './beer.js'

import type { log } from '../log.js'
import type { Pagination } from '../pagination.js'
import type { SearchByName } from '../search.js'
import type {
  BodyRequest,
  IdRequest,
  PaginationRequest,
  SearchByNameRequest
} from '../request.js'

export async function createBeer (
  createIf: CreateIf,
  request: BodyRequest,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await beerService.createBeer(
    createIf,
    request.body,
    log
  )
}

export async function updateBeer (
  updateIf: UpdateIf,
  beerId: string | undefined,
  request: BodyRequest,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await beerService.updateBeer(
    updateIf,
    beerId,
    request.body,
    log
  )
}

export async function findBeerById (
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  request: IdRequest,
  log: log
): Promise<BeerWithBreweriesAndStyles> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await beerService.findBeerById(find, request.id, log)
}

export async function listBeers (
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  request: PaginationRequest,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await beerService.listBeers(list, request.pagination, log)
}

export async function searchBeers (
  search: (searchRequest: SearchByName) =>
    Promise<BeerWithBreweriesAndStyles[]>,
  request: SearchByNameRequest,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await beerService.searchBeers(search, request.searchByName, log)
}
