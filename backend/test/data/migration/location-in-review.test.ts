import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'fs'
import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import { invalidateSchema } from '../test-helpers.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewReview } from '../review/builders.js'
import { FileMigrationProvider, Migrator } from 'kysely/migration'

const directory = dirname(fileURLToPath(import.meta.url))

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  // This test leaves the schema migrated away from the latest version, so
  // the next test file has to build a new database.
  after(invalidateSchema)
  afterEach(ctx.afterEach)

  it('insert a review', async () => {
    const locationName = 'A Fancy place'
    const migrator = new Migrator({
      db: ctx.db.getDb(),
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(directory, '../../../src/data/migrations'),
      }),
    })
    await migrator.migrateTo('2025_01_10_23_48_20_add_location')
    const review = await ctx.db.executeReadWriteTransaction(async (trx) => {
      const beer = await beerRepository.insertBeer(trx, buildNewBeer())
      const container = await containerRepository.insertContainer(
        trx,
        buildNewContainer(),
      )
      // Before the migration a review names its location.
      const reviewRequest = buildNewReview({
        beer: beer.id,
        container: container.id,
        location: locationName,
      })
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      assertDeepEqual(review, {
        ...reviewRequest,
        id: review.id,
      })
      return review
    })
    await migrator.migrateTo('2025_02_02_12_56_30_use_location_in_review')
    const upReview = await reviewRepository.findReviewById(ctx.db, review.id)
    const location = await locationRepository.findLocationById(
      ctx.db,
      upReview.location,
    )
    assertEqual(location?.name, locationName)
    await migrator.migrateTo('2025_01_10_23_48_20_add_location')
    const downReview = await reviewRepository.findReviewById(ctx.db, review.id)
    assertEqual(downReview.location, locationName)
  })
})
