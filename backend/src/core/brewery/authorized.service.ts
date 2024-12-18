import * as authorizationService from '../auth/authorization.service'
import * as breweryService from './internal/service'

import type { BodyRequest, IdRequest } from "../request";
import {
  validateBreweryId,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest
} from "./brewery";
import type { Brewery, NewBrewery } from "./brewery";
import type { log } from '../log'
import type { Pagination } from '../pagination';
import type { AuthTokenPayload } from '../auth/auth-token';
import { type SearchByName, validateSearchByName } from '../search';

export async function createBrewery (
  create: (brewery: NewBrewery) => Promise<Brewery>,
  request: BodyRequest,
  log: log
): Promise<Brewery> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  const createRequest = validateCreateBreweryRequest(request.body)
  return await breweryService.createBrewery(create, createRequest, log)
}

export async function updateBrewery (
  update: (brewery: Brewery) => Promise<Brewery>,
  breweryId: string | undefined,
  request: BodyRequest,
  log: log
): Promise<Brewery> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  const validRequest = validateUpdateBreweryRequest(request.body, breweryId)
  return await breweryService.updateBrewery(
    update,
    validRequest.id,
    validRequest.request,
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
    validateBreweryId(request.id),
    log
  )
}

export async function listBreweries (
  list: (pagination: Pagination) => Promise<Brewery[]>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  log: log
): Promise<Brewery[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await breweryService.listBreweries(list, pagination, log)
}

export async function searchBreweries (
  search: (searchRequest: SearchByName) =>
  Promise<Brewery[]>,
  request: BodyRequest,
  log: log
): Promise<Brewery[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  const validRequest = validateSearchByName(request.body)
  return await breweryService.searchBreweries(search, validRequest, log)
}
