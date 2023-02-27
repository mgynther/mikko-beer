import * as breweryRepository from './brewery.repository'

import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type CreateBreweryRequest, type UpdateBreweryRequest, type Brewery } from './brewery'
import { type BreweryRow } from './brewery.table'

export async function createBrewery (
  db: Kysely<Database>,
  request: CreateBreweryRequest
): Promise<Brewery> {
  const brewery = await breweryRepository.insertBrewery(db, {
    name: request.name
  })

  return breweryRowToBrewery(brewery)
}

export async function updateBrewery (
  db: Kysely<Database>,
  breweryId: string,
  request: UpdateBreweryRequest
): Promise<Brewery> {
  const brewery = await breweryRepository.updateBrewery(db, breweryId, {
    name: request.name
  })

  return breweryRowToBrewery(brewery)
}

export async function findBreweryById (
  db: Kysely<Database>,
  breweryId: string
): Promise<Brewery | undefined> {
  const breweryRow = await breweryRepository.findBreweryById(db, breweryId)

  if (breweryRow != null) {
    return breweryRowToBrewery(breweryRow)
  }
}

export async function lockBreweryById (
  trx: Transaction<Database>,
  id: string
): Promise<Brewery | undefined> {
  const breweryRow = await breweryRepository.lockBreweryById(trx, id)

  if (breweryRow != null) {
    return breweryRowToBrewery(breweryRow)
  }
}

export async function listBreweries (
  db: Kysely<Database>
): Promise<Brewery[] | undefined> {
  const breweryRows = await breweryRepository.listBreweries(db)

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
