import * as breweryService from './service.js'

import {
  validateBreweryId,
  validateCreateBreweryRequest,
  validateUpdateBreweryRequest
} from './validation.js'
import type { Brewery, CreateBreweryRequest } from '../../brewery/brewery.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { SearchByName } from '../../search.js'
import { validateSearchByName } from '../../search.js'

export async function createBrewery (
  create: (brewery: CreateBreweryRequest) => Promise<Brewery>,
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
