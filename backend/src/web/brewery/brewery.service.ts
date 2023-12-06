import * as breweryRepository from '../../data/brewery/brewery.repository'

import { type Database, type Transaction } from '../../data/database'
import {
  type CreateBreweryRequest,
  type UpdateBreweryRequest,
  type Brewery
} from '../../core/brewery/brewery'
import { type BreweryRow } from '../../data/brewery/brewery.table'

import { type Pagination } from '../../core/pagination'
import { type SearchByName } from '../../web/search'

export async function createBrewery (
  trx: Transaction,
  request: CreateBreweryRequest
): Promise<Brewery> {
  const brewery = await breweryRepository.insertBrewery(trx, {
    name: request.name
  })

  return breweryRowToBrewery(brewery)
}

export async function updateBrewery (
  trx: Transaction,
  breweryId: string,
  request: UpdateBreweryRequest
): Promise<Brewery> {
  const brewery = await breweryRepository.updateBrewery(trx, breweryId, {
    name: request.name
  })

  return breweryRowToBrewery(brewery)
}

export async function findBreweryById (
  db: Database,
  breweryId: string
): Promise<Brewery | undefined> {
  const breweryRow = await breweryRepository.findBreweryById(db, breweryId)

  if (breweryRow != null) {
    return breweryRowToBrewery(breweryRow)
  }
}

export async function lockBreweryById (
  trx: Transaction,
  id: string
): Promise<Brewery | undefined> {
  const breweryRow = await breweryRepository.lockBreweryById(trx, id)

  if (breweryRow != null) {
    return breweryRowToBrewery(breweryRow)
  }
}

export async function listBreweries (
  db: Database,
  pagination: Pagination
): Promise<Brewery[] | undefined> {
  const breweryRows = await breweryRepository.listBreweries(db, pagination)

  if (breweryRows === null || breweryRows === undefined) return []

  return breweryRows.map(row => ({
    ...breweryRowToBrewery(row)
  }))
}

export async function searchBreweries (
  db: Database,
  searchRequest: SearchByName
): Promise<Brewery[] | undefined> {
  const breweryRows = await breweryRepository.searchBreweries(db, searchRequest)

  if (breweryRows === null || breweryRows === undefined) return []

  return breweryRows.map(row => ({
    ...breweryRowToBrewery(row)
  }))
}

export function breweryRowToBrewery (brewery: BreweryRow): Brewery {
  return {
    id: brewery.brewery_id,
    name: brewery.name
  }
}
