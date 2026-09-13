import * as authorizationService from '../internal/auth/authorization.service.js'
import * as beerService from '../internal/beer/validated.service.js'

import type {
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  UpdateIf,
  ValidateBeerId,
  ValidateCreateBeer,
  ValidateUpdateBeer,
} from './beer.js'

import type { log } from '../log.js'
import type { Pagination } from '../pagination.js'
import type { SearchByName, ValidateSearchByName } from '../search.js'
import type { BodyRequest, IdRequest, PaginationRequest } from '../request.js'

export async function createBeer(
  createIf: CreateIf,
  validate: ValidateCreateBeer,
  request: BodyRequest,
  log: log,
): Promise<BeerWithBreweryAndStyleIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await beerService.createBeer(createIf, validate, request.body, log)
}

export async function updateBeer(
  updateIf: UpdateIf,
  validate: ValidateUpdateBeer,
  beerId: string | undefined,
  request: BodyRequest,
  log: log,
): Promise<BeerWithBreweryAndStyleIds> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await beerService.updateBeer(
    updateIf,
    validate,
    beerId,
    request.body,
    log,
  )
}

export async function findBeerById(
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  validateId: ValidateBeerId,
  request: IdRequest,
  log: log,
): Promise<BeerWithBreweriesAndStyles> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await beerService.findBeerById(find, validateId, request.id, log)
}

export async function listBeers(
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  request: PaginationRequest,
  log: log,
): Promise<BeerWithBreweriesAndStyles[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await beerService.listBeers(list, request.pagination, log)
}

export async function searchBeers(
  search: (
    searchRequest: SearchByName,
  ) => Promise<BeerWithBreweriesAndStyles[]>,
  validate: ValidateSearchByName,
  request: BodyRequest,
  log: log,
): Promise<BeerWithBreweriesAndStyles[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await beerService.searchBeers(search, validate, request.body, log)
}
