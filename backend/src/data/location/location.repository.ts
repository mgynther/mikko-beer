import type { Database, Transaction } from '../database'
import type {
  LocationRow
} from './location.table'

import type {
  Location,
  CreateLocationRequest
} from '../../core/location/location'
import type {
  Pagination
} from '../../core/pagination'
import type { SearchByName } from '../../core/search'
import { defaultSearchMaxResults, toIlike } from '../../core/search'

export async function insertLocation (
  trx: Transaction,
  location: CreateLocationRequest
): Promise<Location> {
  const insertedLocation = await trx.trx()
    .insertInto('location')
    .values(location)
    .returningAll()
    .executeTakeFirstOrThrow()

  return rowToLocation(insertedLocation)
}

export async function updateLocation (
  trx: Transaction,
  location: Location
): Promise<Location> {
  const updatedLocation = await trx.trx()
    .updateTable('location')
    .set({
      name: location.name
    })
    .where('location_id', '=', location.id)
    .returningAll()
    .executeTakeFirstOrThrow()

  return rowToLocation(updatedLocation)
}

export async function findLocationById (
  db: Database,
  id: string
): Promise<Location | undefined> {
  const locationRow = await db.getDb()
    .selectFrom('location')
    .where('location_id', '=', id)
    .selectAll('location')
    .executeTakeFirst()

  if (locationRow === undefined) {
    return undefined
  }

  return rowToLocation(locationRow)
}

export async function lockLocations (
  trx: Transaction,
  keys: string[]
): Promise<string[]> {
  const locations = await trx.trx()
    .selectFrom('location')
    .where('location_id', 'in', keys)
    .select('location_id')
    .forUpdate()
    .execute()

  return locations.map(location => location.location_id)
}

export async function listLocations (
  db: Database,
  pagination: Pagination
): Promise<Location[]> {
  const locations = await db.getDb()
    .selectFrom('location')
    .selectAll('location')
    .orderBy('location.name')
    .limit(pagination.size)
    .offset(pagination.skip)
    .execute()

  return locations.map(rowToLocation)
}

export async function searchLocations (
  db: Database,
  searchRequest: SearchByName
): Promise<Location[]> {
  const nameIlike = toIlike(searchRequest)
  const locations = await db.getDb()
    .selectFrom('location')
    .selectAll('location')
    .where(
      'location.name', 'ilike', nameIlike
    )
    .limit(defaultSearchMaxResults)
    .execute()

  return locations.map(rowToLocation)
}

function rowToLocation (row: LocationRow): Location {
  return {
    id: row.location_id,
    name: row.name ?? ''
  }
}
