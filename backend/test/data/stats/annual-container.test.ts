import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type { Location } from '../../../src/data/location/location.repository.js'
import type { Pagination } from '../../../src/data/pagination.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import type { StatsIdFilter } from '../../../src/data/stats/stats-filter.js'
import * as annualContainerStatsRepository from '../../../src/data/stats/annual-container.repository.js'
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

const allResults: Pagination = { size: 10, skip: 0 }

interface ContainerRating {
  container: Container
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
  names: { brewery: string; style: string; location: string },
  ratings: ContainerRating[],
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
    ...ratings.map(({ container, rating, time }) =>
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

interface Containers {
  bottle: Container
  can: Container
}

// The kriek is reviewed from a bottle in 2024, the IPA from a can and a
// bottle in 2023. So the stats list 2024 before 2023, and within 2023 the
// bottle before the can, whichever of them is inserted first.
async function insertBeers(db: Database): Promise<{
  containers: Containers
  kriek: ReviewedBeer
  ipa: ReviewedBeer
}> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const [can, bottle] = await Promise.all([
      containerRepository.insertContainer(
        trx,
        buildNewContainer({ type: 'can', size: '0.44' }),
      ),
      containerRepository.insertContainer(
        trx,
        buildNewContainer({ type: 'bottle', size: '0.33' }),
      ),
    ])
    const [kriek, ipa] = await Promise.all([
      insertReviewedBeer(
        trx,
        { brewery: 'Lindemans', style: 'Kriek', location: 'Kuja' },
        [
          {
            container: bottle,
            rating: 5,
            time: new Date('2024-03-01T18:00:00.000Z'),
          },
          {
            container: bottle,
            rating: 7,
            time: new Date('2024-04-01T18:00:00.000Z'),
          },
        ],
      ),
      insertReviewedBeer(
        trx,
        { brewery: 'Nokian Panimo', style: 'IPA', location: 'Oluthuone' },
        [
          {
            container: can,
            rating: 4,
            time: new Date('2023-03-01T18:00:00.000Z'),
          },
          {
            container: can,
            rating: 7,
            time: new Date('2023-04-01T18:00:00.000Z'),
          },
          {
            container: can,
            rating: 10,
            time: new Date('2023-05-01T18:00:00.000Z'),
          },
          {
            container: bottle,
            rating: 9,
            time: new Date('2023-06-01T18:00:00.000Z'),
          },
        ],
      ),
    ])
    return { containers: { bottle, can }, kriek, ipa }
  })
}

function bottle2024(containers: Containers) {
  return {
    containerId: containers.bottle.id,
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '6.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '6.00',
    reviewMode: '5',
    year: '2024',
  }
}

function bottle2023(containers: Containers) {
  return {
    containerId: containers.bottle.id,
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '9.00',
    reviewCount: '1',
    reviewStandardDeviation: '0.00',
    reviewMedian: '9.00',
    reviewMode: '9',
    year: '2023',
  }
}

function can2023(containers: Containers) {
  return {
    containerId: containers.can.id,
    containerSize: '0.44',
    containerType: 'can',
    reviewAverage: '7.00',
    reviewCount: '3',
    reviewStandardDeviation: '2.45',
    reviewMedian: '7.00',
    // Every rating occurs once, and the lowest of a tie wins.
    reviewMode: '4',
    year: '2023',
  }
}

describe('annual container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('no filters', async () => {
    const { containers } = await insertBeers(ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      allResults,
      noFilter,
    )
    assertDeepEqual(stats, [
      bottle2024(containers),
      bottle2023(containers),
      can2023(containers),
    ])
  })

  it('no filters with pagination size', async () => {
    const { containers } = await insertBeers(ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      { size: 1, skip: 0 },
      noFilter,
    )
    assertDeepEqual(stats, [bottle2024(containers)])
  })

  it('no filters with pagination skip', async () => {
    const { containers } = await insertBeers(ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      { size: 1, skip: 1 },
      noFilter,
    )
    assertDeepEqual(stats, [bottle2023(containers)])
  })

  it('filter by brewery', async () => {
    const { containers, kriek } = await insertBeers(ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      allResults,
      { ...noFilter, brewery: kriek.brewery.id },
    )
    assertDeepEqual(stats, [bottle2024(containers)])
  })

  it('filter by location', async () => {
    const { containers, kriek } = await insertBeers(ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      allResults,
      { ...noFilter, location: kriek.location.id },
    )
    assertDeepEqual(stats, [bottle2024(containers)])
  })

  it('filter by style', async () => {
    const { containers, ipa } = await insertBeers(ctx.db)
    const stats = await annualContainerStatsRepository.getAnnualContainer(
      ctx.db,
      allResults,
      { ...noFilter, style: ipa.style.id },
    )
    assertDeepEqual(stats, [bottle2023(containers), can2023(containers)])
  })
})
