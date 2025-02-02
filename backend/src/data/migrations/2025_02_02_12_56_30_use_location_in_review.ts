import type { Kysely } from 'kysely'
import { sql } from 'kysely'

function contains(
  record: Record<string, string>,
  key: any
): boolean {
  if (typeof key !== 'string') {
    return false
  }
  return record[key] !== undefined
}

export async function up (db: Kysely<any>): Promise<void> {
  const reviews = await db.selectFrom('review')
    .select(['review_id', 'location'])
    .where('location', 'not like', '')
    .execute()

  const createdLocations: Record<string, string> = {}
  for (const review of reviews) {
    const locationName: string = review.location
    if (!contains(createdLocations, locationName)) {
      const created = await db
        .insertInto('location')
        .values({
          name: locationName
        })
        .returningAll()
        .executeTakeFirstOrThrow()
      createdLocations[locationName] = created.location_id
    }
    await db.updateTable('review')
      .set({
        location: createdLocations[locationName]
      })
      .where('review_id', '=', review.review_id)
      .execute()
  }
  await db.updateTable('review')
    .set({
      location: null
    })
    .where('location', 'like', '')
    .execute()

  await db.schema
    .alterTable('review')
    .alterColumn('location', (ac) =>
      ac.setDataType(sql`uuid using location::uuid`)
    )
    .execute()

   await db.schema
    .alterTable('review')
    .addForeignKeyConstraint(
      'review_location_fkey',
      ['location'],
      'location',
      ['location_id']
    )
    .execute()
}

interface LocationRow {
  location_id: string
  name: string
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('review')
    .dropConstraint(
      'review_location_fkey'
    )
    .execute()
  await db.schema
    .alterTable('review')
    .alterColumn('location', (ac) =>
      ac.setDataType('text')
    )
    .execute()

  const locations: LocationRow[] = await db.selectFrom('location')
    .select(['location_id', 'name'])
    .execute()
  const locationMap: Record<string, LocationRow> = {}
  locations.forEach(location => {
    locationMap[location.location_id] = location
  })

  const reviews = await db.selectFrom('review')
    .select(['review_id', 'location'])
    .where('location', 'not like', '')
    .execute()

  for (const review of reviews) {
    const locationId: string = review.location
    await db.updateTable('review')
      .set({
        location: locationMap[locationId].name
      })
      .where('review_id', '=', review.review_id)
      .execute()
  }
}
