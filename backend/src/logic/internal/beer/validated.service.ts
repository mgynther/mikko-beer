import * as beerService from './service.js'

import type {
  BeerWithBreweriesAndStyles,
  BeerWithBreweryAndStyleIds,
  CreateIf,
  UpdateIf,
  ValidateBeerId,
  ValidateCreateBeer,
  ValidateUpdateBeer,
} from '../../beer/beer.js'

import type { SearchByName, ValidateSearchByName } from '../../search.js'
import {
  invalidBeerError,
  invalidBeerIdError,
  invalidSearchError,
} from '../../errors.js'

import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'

export async function createBeer(
  createIf: CreateIf,
  validate: ValidateCreateBeer,
  body: unknown,
  log: log,
): Promise<BeerWithBreweryAndStyleIds> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-beer') {
    throw invalidBeerError
  }
  return await beerService.createBeer(createIf, validationResult.result, log)
}

export async function updateBeer(
  updateIf: UpdateIf,
  validate: ValidateUpdateBeer,
  beerId: string | undefined,
  body: unknown,
  log: log,
): Promise<BeerWithBreweryAndStyleIds> {
  const validationResult = validate(body, beerId)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-beer':
        throw invalidBeerError
      case 'invalid-beer-id':
        throw invalidBeerIdError
    }
  }
  return await beerService.updateBeer(
    updateIf,
    validationResult.result.id,
    validationResult.result.request,
    log,
  )
}

export async function findBeerById(
  find: (id: string) => Promise<BeerWithBreweriesAndStyles | undefined>,
  validateBeerId: ValidateBeerId,
  id: string | undefined,
  log: log,
): Promise<BeerWithBreweriesAndStyles> {
  const idResult = validateBeerId(id)
  if (idResult.errorCode === 'invalid-beer-id') {
    throw invalidBeerIdError
  }
  return await beerService.findBeerById(find, idResult.result, log)
}

export async function listBeers(
  list: (pagination: Pagination) => Promise<BeerWithBreweriesAndStyles[]>,
  pagination: Pagination,
  log: log,
): Promise<BeerWithBreweriesAndStyles[]> {
  return await beerService.listBeers(list, pagination, log)
}

export async function searchBeers(
  search: (
    searchRequest: SearchByName,
  ) => Promise<BeerWithBreweriesAndStyles[]>,
  validate: ValidateSearchByName,
  body: unknown,
  log: log,
): Promise<BeerWithBreweriesAndStyles[]> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-search') {
    throw invalidSearchError
  }
  return await beerService.searchBeers(search, validationResult.result, log)
}
