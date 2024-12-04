import * as authService from '../../core/authentication/authentication.service'
import * as beerService from '../../core/beer/beer.service'

import type {
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  UpdateIf
} from "./beer";

import {
  validateCreateBeerRequest,
  validateUpdateBeerRequest
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
  authService.authenticateAdminPayload(request.authTokenPayload)
  const createBeerRequest = validateCreateBeerRequest(request.body)
  return await beerService.createBeer(
    createIf,
    createBeerRequest,
    log
  )
}

export async function updateBeer (
  updateIf: UpdateIf,
  beerId: string,
  request: BodyRequest,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  authService.authenticateAdminPayload(request.authTokenPayload)
  const updateBeerRequest = validateUpdateBeerRequest(request.body, beerId)
  return await beerService.updateBeer(
    updateIf,
    beerId,
    updateBeerRequest,
    log
  )
}

export async function findBeerById (
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  request: IdRequest,
  log: log
): Promise<BeerWithBreweriesAndStyles> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await beerService.findBeerById(find, request.id, log)
}

export async function listBeers (
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  request: PaginationRequest,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await beerService.listBeers(list, request.pagination, log)
}

export async function searchBeers (
  search: (searchRequest: SearchByName) =>
    Promise<BeerWithBreweriesAndStyles[]>,
  request: SearchByNameRequest,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  authService.authenticateViewerPayload(request.authTokenPayload)
  return await beerService.searchBeers(search, request.searchByName, log)
}
