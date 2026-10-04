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
import type { LocationStatsOrder } from '../../../src/data/stats/location.repository.js'
import type { StatsFilter } from '../../../src/data/stats/stats-filter.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import * as locationStatsRepository from '../../../src/data/stats/location.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'
import { buildNewStyle } from '../style/builders.js'

// Lets every review through, so that a test filters by what it sets.
const noFilter: StatsFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
  maxReviewAverage: 10,
  minReviewAverage: 4,
  maxReviewCount: Infinity,
  minReviewCount: 1,
  timeStart: undefined,
  timeEnd: undefined,
}

interface Rating {
  rating: number
  time: Date
}

interface ReviewedLocation {
  location: Location
  brewery: Brewery
  style: Style
}

// A location whose reviews are all of one beer, of a brewery and a style
// of its own, so that filtering by that brewery or style keeps exactly
// this location. Location, brewery and style names are unique, so the
// caller names them.
async function insertReviewedLocation(
  trx: Transaction,
  container: Container,
  names: { location: string; brewery: string; style: string },
  ratings: Rating[],
): Promise<ReviewedLocation> {
  const [location, brewery, style, beer] = await Promise.all([
    locationRepository.insertLocation(
      trx,
      buildNewLocation({ name: names.location }),
    ),
    breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: names.brewery }),
    ),
    styleRepository.insertStyle(trx, buildNewStyle({ name: names.style })),
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
  return { location, brewery, style }
}

// Kuja comes before Oluthuone by name and has fewer reviews, a lower
// average and a lower deviation, so every order puts Kuja first ascending
// and Oluthuone first descending. The reviews of Kuja are from 2024 and
// those of Oluthuone from 2023, so a time filter keeps one of them.
async function insertLocations(
  db: Database,
): Promise<{ kuja: ReviewedLocation; oluthuone: ReviewedLocation }> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const container = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )
    const [kuja, oluthuone] = await Promise.all([
      insertReviewedLocation(
        trx,
        container,
        { location: 'Kuja', brewery: 'Lindemans', style: 'Kriek' },
        [
          { rating: 5, time: new Date('2024-03-01T18:00:00.000Z') },
          { rating: 7, time: new Date('2024-04-01T18:00:00.000Z') },
        ],
      ),
      insertReviewedLocation(
        trx,
        container,
        { location: 'Oluthuone', brewery: 'Nokian Panimo', style: 'IPA' },
        [
          { rating: 4, time: new Date('2023-03-01T18:00:00.000Z') },
          { rating: 7, time: new Date('2023-04-01T18:00:00.000Z') },
          { rating: 10, time: new Date('2023-05-01T18:00:00.000Z') },
        ],
      ),
    ])
    return { kuja, oluthuone }
  })
}

function kujaStats(kuja: ReviewedLocation) {
  return {
    reviewAverage: '6.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '6.00',
    reviewMode: '5',
    locationId: kuja.location.id,
    locationName: 'Kuja',
  }
}

function oluthuoneStats(oluthuone: ReviewedLocation) {
  return {
    reviewAverage: '7.00',
    reviewCount: '3',
    reviewStandardDeviation: '2.45',
    reviewMedian: '7.00',
    // Every rating occurs once, and the lowest of a tie wins.
    reviewMode: '4',
    locationId: oluthuone.location.id,
    locationName: 'Oluthuone',
  }
}

suite('location stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function getLocation(
    filter: StatsFilter,
    order: LocationStatsOrder,
  ): ReturnType<typeof locationStatsRepository.getLocation> {
    return await locationStatsRepository.getLocation(
      ctx.db,
      { size: 10, skip: 0 },
      filter,
      order,
    )
  }

  const orderProperties: LocationStatsOrder['property'][] = [
    'average',
    'count',
    'location_name',
    'std_dev',
  ]

  orderProperties.forEach((property) => {
    test(`by ${property} asc`, async () => {
      const { kuja, oluthuone } = await insertLocations(ctx.db)
      const stats = await getLocation(noFilter, { property, direction: 'asc' })
      assertDeepEqual(stats, [kujaStats(kuja), oluthuoneStats(oluthuone)])
    })

    test(`by ${property} desc`, async () => {
      const { kuja, oluthuone } = await insertLocations(ctx.db)
      const stats = await getLocation(noFilter, { property, direction: 'desc' })
      assertDeepEqual(stats, [oluthuoneStats(oluthuone), kujaStats(kuja)])
    })
  })

  const byName: LocationStatsOrder = {
    property: 'location_name',
    direction: 'asc',
  }

  test('filter by brewery', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, brewery: kuja.brewery.id },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  test('filter by location', async () => {
    const { oluthuone } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, location: oluthuone.location.id },
      byName,
    )
    assertDeepEqual(stats, [oluthuoneStats(oluthuone)])
  })

  test('filter by style', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, style: kuja.style.id },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  test('filter by min review count', async () => {
    const { oluthuone } = await insertLocations(ctx.db)
    const stats = await getLocation({ ...noFilter, minReviewCount: 3 }, byName)
    assertDeepEqual(stats, [oluthuoneStats(oluthuone)])
  })

  test('filter by max review count', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation({ ...noFilter, maxReviewCount: 2 }, byName)
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  test('filter by min review average', async () => {
    const { oluthuone } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, minReviewAverage: 6.5 },
      byName,
    )
    assertDeepEqual(stats, [oluthuoneStats(oluthuone)])
  })

  test('filter by max review average', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, maxReviewAverage: 6.5 },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  test('filter by start time', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, timeStart: new Date('2024-01-01T00:00:00.000Z') },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  test('filter by end time', async () => {
    const { oluthuone } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, timeEnd: new Date('2024-01-01T00:00:00.000Z') },
      byName,
    )
    assertDeepEqual(stats, [oluthuoneStats(oluthuone)])
  })

  test('list a page of locations', async () => {
    const { oluthuone } = await insertLocations(ctx.db)
    const stats = await locationStatsRepository.getLocation(
      ctx.db,
      { size: 1, skip: 1 },
      noFilter,
      byName,
    )
    assertDeepEqual(stats, [oluthuoneStats(oluthuone)])
  })

  test('filter by review count bounds inclusively', async () => {
    const { oluthuone } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, minReviewCount: 3, maxReviewCount: 3 },
      byName,
    )
    assertDeepEqual(stats, [oluthuoneStats(oluthuone)])
  })

  test('filter by review average bounds inclusively', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation(
      { ...noFilter, minReviewAverage: 6, maxReviewAverage: 6 },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  test('filter by time bounds inclusively', async () => {
    const { kuja } = await insertLocations(ctx.db)
    const stats = await getLocation(
      {
        ...noFilter,
        timeStart: new Date('2024-03-01T18:00:00.000Z'),
        timeEnd: new Date('2024-04-01T18:00:00.000Z'),
      },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })

  // Reviews of one Koskipanimo lager at each location, so that only the
  // ratings tell the locations apart.
  async function insertRatedLocations(
    ratings: Record<string, number[]>,
  ): Promise<void> {
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const [container, brewery, style, beer] = await Promise.all([
        containerRepository.insertContainer(trx, buildNewContainer()),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Koskipanimo' }),
        ),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lager' })),
        beerRepository.insertBeer(trx, buildNewBeer()),
      ])
      await Promise.all([
        beerRepository.insertBeerBreweries(trx, [
          { beer: beer.id, brewery: brewery.id },
        ]),
        beerRepository.insertBeerStyles(trx, [
          { beer: beer.id, style: style.id },
        ]),
      ])
      const time = new Date('2024-03-01T18:00:00.000Z')
      await Promise.all(
        Object.entries(ratings).map(async ([name, locationRatings]) => {
          const location = await locationRepository.insertLocation(
            trx,
            buildNewLocation({ name }),
          )
          await Promise.all(
            locationRatings.map(
              async (rating: number) =>
                await reviewRepository.insertReview(
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
          )
        }),
      )
    })
  }

  // A tie is broken the same way whichever the direction of the order.
  const tieCases: Array<{
    title: string
    property: LocationStatsOrder['property']
    ratings: Record<string, number[]>
    expected: string[]
  }> = [
    {
      title: 'average, ties by count desc and then by name',
      property: 'average',
      ratings: { Huurre: [7], Kuja: [6, 8], Oluthuone: [7, 7] },
      expected: ['Kuja', 'Oluthuone', 'Huurre'],
    },
    {
      title: 'count, ties by average desc and then by name',
      property: 'count',
      ratings: { Huurre: [5, 7], Kuja: [6, 8], Oluthuone: [7, 7] },
      expected: ['Kuja', 'Oluthuone', 'Huurre'],
    },
    {
      title: 'std_dev, ties by count desc, average desc and then by name',
      property: 'std_dev',
      ratings: {
        Huurre: [7],
        Kuja: [8, 8],
        Oluthuone: [7, 7],
        Plevna: [8, 8],
      },
      expected: ['Kuja', 'Plevna', 'Oluthuone', 'Huurre'],
    },
  ]

  tieCases.forEach(({ title, property, ratings, expected }) => {
    ;(['asc', 'desc'] as const).forEach((direction) => {
      test(`by ${title}, ${direction}`, async () => {
        await insertRatedLocations(ratings)
        const stats = await getLocation(noFilter, { property, direction })
        assertDeepEqual(
          stats.map((stat) => stat.locationName),
          expected,
        )
      })
    })
  })

  test('leave out reviews without a location', async () => {
    const { kuja } = await insertLocations(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      const container = await containerRepository.insertContainer(
        trx,
        buildNewContainer({ type: 'can', size: '0.50' }),
      )
      const beer = await beerRepository.insertBeer(trx, buildNewBeer())
      await Promise.all([
        beerRepository.insertBeerBreweries(trx, [
          { beer: beer.id, brewery: kuja.brewery.id },
        ]),
        beerRepository.insertBeerStyles(trx, [
          { beer: beer.id, style: kuja.style.id },
        ]),
        reviewRepository.insertReview(
          trx,
          buildNewReview({
            beer: beer.id,
            container: container.id,
            location: '',
            rating: 10,
          }),
        ),
      ])
    })
    const stats = await getLocation(
      { ...noFilter, brewery: kuja.brewery.id },
      byName,
    )
    assertDeepEqual(stats, [kujaStats(kuja)])
  })
})
