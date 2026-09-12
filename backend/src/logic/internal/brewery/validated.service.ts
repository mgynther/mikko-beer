import * as breweryService from './service.js'

import type {
  Brewery,
  CreateBreweryRequest,
  ValidateBreweryId,
  ValidateCreateBrewery,
  ValidateUpdateBrewery,
} from '../../brewery/brewery.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { SearchByName } from '../../search.js'
import { validateSearchByName } from '../../search.js'
import { invalidBreweryError, invalidBreweryIdError } from '../../errors.js'

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
  pagination: Pagination,
  log: log,
): Promise<Brewery[]> {
  return await breweryService.listBreweries(list, pagination, log)
}

export async function searchBreweries(
  search: (searchRequest: SearchByName) => Promise<Brewery[]>,
  body: unknown,
  log: log,
): Promise<Brewery[]> {
  const validRequest = validateSearchByName(body)
  return await breweryService.searchBreweries(search, validRequest, log)
}
