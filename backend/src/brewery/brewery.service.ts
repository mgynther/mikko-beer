import * as breweryRepository from './brewery.repository'

import { Kysely, Transaction } from 'kysely'
import { Database } from '../database'
import { CreateBreweryRequest, Brewery } from './brewery'
import { BreweryRow } from './brewery.table'

export async function createBrewery(
  db: Kysely<Database>,
  request: CreateBreweryRequest
): Promise<Brewery> {
  const brewery = await breweryRepository.insertBrewery(db, {
    name: request.name,
  })

  return breweryRowToBrewery(brewery)
}

export async function findBreweryById(
  db: Kysely<Database>,
  breweryId: string
): Promise<Brewery | undefined> {
  const breweryRow = await breweryRepository.findBreweryById(db, breweryId)

  if (breweryRow) {
    return breweryRowToBrewery(breweryRow)
  }
}

export async function lockBreweryById(
  trx: Transaction<Database>,
  id: string
): Promise<Brewery | undefined> {
  const breweryRow = await breweryRepository.lockBreweryById(trx, id)

  if (breweryRow) {
    return breweryRowToBrewery(breweryRow)
  }
}

export function breweryRowToBrewery(brewery: BreweryRow): Brewery {
  return {
    id: brewery.brewery_id,
    name: brewery.name,
  }
}
