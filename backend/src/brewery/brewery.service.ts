import * as breweryRepository from './brewery.repository'

import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type CreateBreweryRequest, type Brewery } from './brewery'
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

export function breweryRowToBrewery (brewery: BreweryRow): Brewery {
  return {
    id: brewery.brewery_id,
    name: brewery.name
  }
}
