import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from 'fs'
import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import * as locationRepository
from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import { insertData } from '../review-helpers.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { FileMigrationProvider, Migrator } from 'kysely'

const directory = dirname(fileURLToPath(import.meta.url));

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
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
      const { beer, container } = await insertData(trx)
      const reviewRequest = {
        beer: beer.id,
        additionalInfo: "additional",
        container: container.id,
        location: locationName,
        rating: 8,
        time: new Date(),
        smell: "vanilla",
        taste: "chocolate"
      }
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      assertDeepEqual(review, {
        ...reviewRequest,
        id: review.id,
      })
      return review
    })
    await migrator.migrateTo('2025_02_02_12_56_30_use_location_in_review')
    const upReview =
      await reviewRepository.findReviewById(ctx.db, review.id)
    const location = await locationRepository.findLocationById(
      ctx.db,
      upReview.location
    )
    assertEqual(location?.name, locationName)
    await migrator.migrateTo('2025_01_10_23_48_20_add_location')
    const downReview =
      await reviewRepository.findReviewById(ctx.db, review.id)
    assertEqual(downReview.location, locationName)
  })
})
