import * as authorizationService from '../internal/auth/authorization.service'
import * as beerService from '../internal/beer/validated.service'

import type {
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  UpdateIf
} from "./beer";

import type { log } from '../log'
import type { Pagination } from '../pagination';
import type { SearchByName } from '../search';
import type {
  BodyRequest,
  IdRequest,
  PaginationRequest,
  SearchByNameRequest
} from '../request';

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
