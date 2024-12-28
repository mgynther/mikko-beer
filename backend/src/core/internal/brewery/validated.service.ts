import * as breweryService from './service'

import {
  validateBreweryId,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest
} from "../../brewery";
import type { Brewery, NewBrewery } from "../../brewery";
import type { log } from '../../log'
import type { Pagination } from '../../pagination';
import type { SearchByName } from '../../search';
import { validateSearchByName } from '../../search';

export async function createBrewery (
  create: (brewery: NewBrewery) => Promise<Brewery>,
  body: unknown,
  log: log
): Promise<Brewery> {
  const createRequest = validateCreateBreweryRequest(body)
  return await breweryService.createBrewery(create, createRequest, log)
}

export async function updateBrewery (
  update: (brewery: Brewery) => Promise<Brewery>,
  breweryId: string | undefined,
  body: unknown,
  log: log
): Promise<Brewery> {
  const validRequest = validateUpdateBreweryRequest(body, breweryId)
  return await breweryService.updateBrewery(
    update,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findBreweryById (
  find: (id: string) => Promise<Brewery | undefined>,
  id: string | undefined,
  log: log
): Promise<Brewery> {
  return await breweryService.findBreweryById(
    find,
    validateBreweryId(id),
    log
  )
}

export async function listBreweries (
  list: (pagination: Pagination) => Promise<Brewery[]>,
  pagination: Pagination,
  log: log
): Promise<Brewery[]> {
  return await breweryService.listBreweries(list, pagination, log)
}

export async function searchBreweries (
  search: (searchRequest: SearchByName) =>
  Promise<Brewery[]>,
  body: unknown,
  log: log
): Promise<Brewery[]> {
  const validRequest = validateSearchByName(body)
  return await breweryService.searchBreweries(search, validRequest, log)
}
