import * as breweryService from './service.js'

import type {
  Brewery,
  CreateBreweryRequest,
  ValidateBreweryId,
  ValidateCreateBrewery,
  ValidateUpdateBrewery,
  BreweryList,
} from '../../brewery/brewery.js'
import type { log } from '../../log.js'
import type {
  Pagination,
  PaginationQuery,
  ValidatePagination,
} from '../../pagination.js'
import { validPagination } from '../pagination.js'
import type { SearchByName, ValidateSearchByName } from '../../search.js'
import {
  invalidBreweryError,
  invalidBreweryIdError,
  invalidSearchError,
} from '../../errors.js'

export async function createBrewery(
  create: (brewery: CreateBreweryRequest) => Promise<Brewery>,
  validate: ValidateCreateBrewery,
  body: unknown,
  log: log,
): Promise<Brewery> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-brewery') {
    throw invalidBreweryError
  }
  return await breweryService.createBrewery(
    create,
    validationResult.result,
    log,
  )
}

export async function updateBrewery(
  update: (brewery: Brewery) => Promise<Brewery>,
  validate: ValidateUpdateBrewery,
  breweryId: string | undefined,
  body: unknown,
  log: log,
): Promise<Brewery> {
  const validationResult = validate(body, breweryId)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-brewery':
        throw invalidBreweryError
      case 'invalid-brewery-id':
        throw invalidBreweryIdError
    }
  }
  return await breweryService.updateBrewery(
    update,
    validationResult.result.id,
    validationResult.result.request,
    log,
  )
}

export async function findBreweryById(
  find: (id: string) => Promise<Brewery | undefined>,
  validateBreweryId: ValidateBreweryId,
  id: string | undefined,
  log: log,
): Promise<Brewery> {
  const idResult = validateBreweryId(id)
  if (idResult.errorCode === 'invalid-brewery-id') {
    throw invalidBreweryIdError
  }
  return await breweryService.findBreweryById(find, idResult.result, log)
}

export async function listBreweries(
  list: (pagination: Pagination) => Promise<Brewery[]>,
  validatePagination: ValidatePagination,
  query: PaginationQuery,
  log: log,
): Promise<BreweryList> {
  const pagination = validPagination(validatePagination, query)
  const breweries = await breweryService.listBreweries(list, pagination, log)
  return { breweries, pagination }
}

export async function searchBreweries(
  search: (searchRequest: SearchByName) => Promise<Brewery[]>,
  validate: ValidateSearchByName,
  body: unknown,
  log: log,
): Promise<Brewery[]> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-search') {
    throw invalidSearchError
  }
  return await breweryService.searchBreweries(
    search,
    validationResult.result,
    log,
  )
}
