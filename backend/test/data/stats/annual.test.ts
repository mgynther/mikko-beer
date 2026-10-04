import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type { Location } from '../../../src/data/location/location.repository.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import type { StatsIdFilter } from '../../../src/data/stats/stats-filter.js'
import * as annualStatsRepository from '../../../src/data/stats/annual.repository.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'
import { buildNewStyle } from '../style/builders.js'

const noFilter: StatsIdFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
}

interface Rating {
  rating: number
  time: Date
}

interface ReviewedBeer {
  brewery: Brewery
  location: Location
  style: Style
}

// A beer of a brewery and a style of its own, reviewed at a location of its
// own, so that filtering by any of the three keeps exactly its reviews.
// Brewery, style and location names are unique, so the caller names them.
async function insertReviewedBeer(
  trx: Transaction,
  container: Container,
  names: { brewery: string; style: string; location: string },
  ratings: Rating[],
): Promise<ReviewedBeer> {
  const [brewery, style, location, beer] = await Promise.all([
    breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: names.brewery }),
    ),
    styleRepository.insertStyle(trx, buildNewStyle({ name: names.style })),
    locationRepository.insertLocation(
      trx,
      buildNewLocation({ name: names.location }),
    ),
    beerRepository.insertBeer(trx, buildNewBeer()),
  ])
  await Promise.all([
    beerRepository.insertBeerBreweries(trx, [
      { beer: beer.id, brewery: brewery.id },
    ]),
    beerRepository.insertBeerStyles(trx, [{ beer: beer.id, style: style.id }]),
    ...ratings.map(({ rating, time }) =>
      reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer: beer.id,
          container: container.id,
          location: location.id,
          rating,
          time,
        }),
      ),
    ),
  ])
  return { brewery, location, style }
}

// The kriek is reviewed only in 2024 and the IPA only in 2023, so a filter
// that keeps one of the beers keeps one of the years.
async function insertBeers(
  db: Database,
): Promise<{ kriek: ReviewedBeer; ipa: ReviewedBeer }> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const container = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )
    const [kriek, ipa] = await Promise.all([
      insertReviewedBeer(
        trx,
        container,
        { brewery: 'Lindemans', style: 'Kriek', location: 'Kuja' },
        [
          { rating: 5, time: new Date('2024-03-01T18:00:00.000Z') },
          { rating: 7, time: new Date('2024-04-01T18:00:00.000Z') },
        ],
      ),
      insertReviewedBeer(
        trx,
        container,
        { brewery: 'Nokian Panimo', style: 'IPA', location: 'Oluthuone' },
        [
          { rating: 4, time: new Date('2023-03-01T18:00:00.000Z') },
          { rating: 7, time: new Date('2023-04-01T18:00:00.000Z') },
          { rating: 10, time: new Date('2023-05-01T18:00:00.000Z') },
        ],
      ),
    ])
    return { kriek, ipa }
  })
}

const stats2024 = {
  reviewAverage: '6.00',
  reviewCount: '2',
  reviewStandardDeviation: '1.00',
  reviewMedian: '6.00',
  reviewMode: '5',
  year: '2024',
}

const stats2023 = {
  reviewAverage: '7.00',
  reviewCount: '3',
  reviewStandardDeviation: '2.45',
  reviewMedian: '7.00',
  // Every rating occurs once, and the lowest of a tie wins.
  reviewMode: '4',
  year: '2023',
}

suite('annual stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('no filters', async () => {
    await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, noFilter)
    assertDeepEqual(stats, [stats2024, stats2023])
  })

  test('no filters & no reviews', async () => {
    const stats = await annualStatsRepository.getAnnual(ctx.db, noFilter)
    assertDeepEqual(stats, [])
  })

  test('filter by brewery', async () => {
    const { kriek } = await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      ...noFilter,
      brewery: kriek.brewery.id,
    })
    assertDeepEqual(stats, [stats2024])
  })

  test('filter by brewery, location & style', async () => {
    const { kriek } = await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      brewery: kriek.brewery.id,
      location: kriek.location.id,
      style: kriek.style.id,
    })
    assertDeepEqual(stats, [stats2024])
  })

  test('filter by location', async () => {
    const { kriek } = await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      ...noFilter,
      location: kriek.location.id,
    })
    assertDeepEqual(stats, [stats2024])
  })

  test('filter by style', async () => {
    const { ipa } = await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      ...noFilter,
      style: ipa.style.id,
    })
    assertDeepEqual(stats, [stats2023])
  })

  test('filter by brewery and a location of another brewery', async () => {
    const { kriek, ipa } = await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      ...noFilter,
      brewery: kriek.brewery.id,
      location: ipa.location.id,
    })
    assertDeepEqual(stats, [])
  })

  test('filter by brewery and a style of another brewery', async () => {
    const { kriek, ipa } = await insertBeers(ctx.db)
    const stats = await annualStatsRepository.getAnnual(ctx.db, {
      ...noFilter,
      brewery: kriek.brewery.id,
      style: ipa.style.id,
    })
    assertDeepEqual(stats, [])
  })
})
