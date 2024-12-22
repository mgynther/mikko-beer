import * as beerService from './service'

import type {
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  UpdateIf
} from "../beer";

import {
  validateBeerId,
  validateCreateBeerRequest,
  validateUpdateBeerRequest
} from "../beer";
import type { SearchByName } from '../../search';

import type { log } from '../../log'
import type { Pagination } from '../../pagination';

export async function createBeer (
  createIf: CreateIf,
  body: unknown,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  const createBeerRequest = validateCreateBeerRequest(body)
  return await beerService.createBeer(
    createIf,
    createBeerRequest,
    log
  )
}

export async function updateBeer (
  updateIf: UpdateIf,
  beerId: string | undefined,
  body: unknown,
  log: log
): Promise<BeerWithBreweryAndStyleIds> {
  const validRequest = validateUpdateBeerRequest(body, beerId)
  return await beerService.updateBeer(
    updateIf,
    validRequest.id,
    validRequest.request,
    log
  )
}

export async function findBeerById (
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  id: string | undefined,
  log: log
): Promise<BeerWithBreweriesAndStyles> {
  return await beerService.findBeerById(find, validateBeerId(id), log)
}

export async function listBeers (
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  pagination: Pagination,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  return await beerService.listBeers(list, pagination, log)
}

export async function searchBeers (
  search: (searchRequest: SearchByName) =>
    Promise<BeerWithBreweriesAndStyles[]>,
  searchRequest: SearchByName,
  log: log
): Promise<BeerWithBreweriesAndStyles[]> {
  return await beerService.searchBeers(search, searchRequest, log)
}
