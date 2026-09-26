import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type { Location } from '../../../src/data/location/location.repository.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import type { BreweryStatsOrder } from '../../../src/data/stats/brewery.repository.js'
import type { StatsFilter } from '../../../src/data/stats/stats-filter.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import * as breweryStatsRepository from '../../../src/data/stats/brewery.repository.js'
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

async function insertReviews(
  trx: Transaction,
  beer: Beer,
  container: Container,
  location: Location,
  ratings: Rating[],
): Promise<void> {
  await Promise.all(
    ratings.map(({ rating, time }) =>
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
  )
}

interface ReviewedBrewery {
  brewery: Brewery
  location: Location
  style: Style
}

// A brewery with one beer of a style of its own, reviewed at a location of
// its own, so that filtering by the brewery, the style or the location
// keeps exactly this brewery. Brewery, style and location names are
// unique, so the caller names them.
async function insertReviewedBrewery(
  trx: Transaction,
  container: Container,
  names: {
    brewery: string
    country: string | undefined
    style: string
    location: string
  },
  ratings: Rating[],
): Promise<ReviewedBrewery> {
  const brewery = await breweryRepository.insertBrewery(
    trx,
    buildNewBrewery({ name: names.brewery, country: names.country }),
  )
  const style = await styleRepository.insertStyle(
    trx,
    buildNewStyle({ name: names.style }),
  )
  const location = await locationRepository.insertLocation(
    trx,
    buildNewLocation({ name: names.location }),
  )
  const beer = await beerRepository.insertBeer(trx, buildNewBeer())
  await beerRepository.insertBeerBreweries(trx, [
    { beer: beer.id, brewery: brewery.id },
  ])
  await beerRepository.insertBeerStyles(trx, [
    { beer: beer.id, style: style.id },
  ])
  await insertReviews(trx, beer, container, location, ratings)
  return { brewery, location, style }
}

// Lindemans comes before Nokian Panimo by name and has fewer reviews, a
// lower average and a lower deviation, so every order puts Lindemans first
// ascending and Nokian Panimo first descending. The reviews of Lindemans
// are from 2024 and those of Nokian Panimo from 2023, so a time filter
// keeps one of them. Nokian Panimo has no country.
async function insertBreweries(db: Database): Promise<{
  lindemans: ReviewedBrewery
  nokian: ReviewedBrewery
}> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const container = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )
    const lindemans = await insertReviewedBrewery(
      trx,
      container,
      {
        brewery: 'Lindemans',
        country: 'BE',
        style: 'Kriek',
        location: 'Kuja',
      },
      [
        { rating: 5, time: new Date('2024-03-01T18:00:00.000Z') },
        { rating: 7, time: new Date('2024-04-01T18:00:00.000Z') },
      ],
    )
    const nokian = await insertReviewedBrewery(
      trx,
      container,
      {
        brewery: 'Nokian Panimo',
        country: undefined,
        style: 'IPA',
        location: 'Oluthuone',
      },
      [
        { rating: 4, time: new Date('2023-03-01T18:00:00.000Z') },
        { rating: 7, time: new Date('2023-04-01T18:00:00.000Z') },
        { rating: 10, time: new Date('2023-05-01T18:00:00.000Z') },
      ],
    )
    return { lindemans, nokian }
  })
}

function lindemansStats(lindemans: ReviewedBrewery) {
  return {
    reviewAverage: '6.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '6.00',
    reviewMode: '5',
    reviewedBeerCount: '1',
    breweryId: lindemans.brewery.id,
    breweryName: 'Lindemans',
    breweryCountry: 'BE',
  }
}

function nokianStats(nokian: ReviewedBrewery) {
  return {
    reviewAverage: '7.00',
    reviewCount: '3',
    reviewStandardDeviation: '2.45',
    reviewMedian: '7.00',
    // Every rating occurs once, and the lowest of a tie wins.
    reviewMode: '4',
    reviewedBeerCount: '1',
    breweryId: nokian.brewery.id,
    breweryName: 'Nokian Panimo',
    breweryCountry: undefined,
  }
}

interface Collaboration {
  salama: Brewery
  brewdog: Brewery
}

// Salama brews a beer of its own and a collaboration beer with Brewdog.
// The own beer is rated 5 and 7, the collaboration beer 4 and 10.
async function insertCollaboration(db: Database): Promise<Collaboration> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const salama = await breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: 'Salama', country: 'FI' }),
    )
    const brewdog = await breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: 'Brewdog', country: 'GB' }),
    )
    const ownBeer = await beerRepository.insertBeer(trx, buildNewBeer())
    const collaborationBeer = await beerRepository.insertBeer(
      trx,
      buildNewBeer(),
    )
    await beerRepository.insertBeerBreweries(trx, [
      { beer: ownBeer.id, brewery: salama.id },
      { beer: collaborationBeer.id, brewery: salama.id },
      { beer: collaborationBeer.id, brewery: brewdog.id },
    ])
    const container = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )
    const location = await locationRepository.insertLocation(
      trx,
      buildNewLocation(),
    )
    const time = new Date('2024-03-01T18:00:00.000Z')
    await insertReviews(trx, ownBeer, container, location, [
      { rating: 5, time },
      { rating: 7, time },
    ])
    await insertReviews(trx, collaborationBeer, container, location, [
      { rating: 4, time },
      { rating: 10, time },
    ])
    return { salama, brewdog }
  })
}

function brewdogStats(brewdog: Brewery) {
  return {
    reviewAverage: '7.00',
    reviewCount: '2',
    reviewStandardDeviation: '3.00',
    reviewMedian: '7.00',
    reviewMode: '4',
    reviewedBeerCount: '1',
    breweryId: brewdog.id,
    breweryName: 'Brewdog',
    breweryCountry: 'GB',
  }
}

describe('brewery stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function getBrewery(
    filter: StatsFilter,
    order: BreweryStatsOrder,
  ): ReturnType<typeof breweryStatsRepository.getBrewery> {
    return await breweryStatsRepository.getBrewery(
      ctx.db,
      { size: 10, skip: 0 },
      filter,
      order,
    )
  }

  const orderProperties: BreweryStatsOrder['property'][] = [
    'average',
    'brewery_name',
    'count',
    'std_dev',
  ]

  orderProperties.forEach((property) => {
    it(`by ${property} asc`, async () => {
      const { lindemans, nokian } = await insertBreweries(ctx.db)
      const stats = await getBrewery(noFilter, { property, direction: 'asc' })
      assertDeepEqual(stats, [lindemansStats(lindemans), nokianStats(nokian)])
    })

    it(`by ${property} desc`, async () => {
      const { lindemans, nokian } = await insertBreweries(ctx.db)
      const stats = await getBrewery(noFilter, { property, direction: 'desc' })
      assertDeepEqual(stats, [nokianStats(nokian), lindemansStats(lindemans)])
    })
  })

  const byName: BreweryStatsOrder = {
    property: 'brewery_name',
    direction: 'asc',
  }

  it('filter by brewery', async () => {
    const { nokian } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, brewery: nokian.brewery.id },
      byName,
    )
    assertDeepEqual(stats, [nokianStats(nokian)])
  })

  it('filter by location', async () => {
    const { nokian } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, location: nokian.location.id },
      byName,
    )
    assertDeepEqual(stats, [nokianStats(nokian)])
  })

  it('filter by style', async () => {
    const { lindemans } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, style: lindemans.style.id },
      byName,
    )
    assertDeepEqual(stats, [lindemansStats(lindemans)])
  })

  it('filter by min review count', async () => {
    const { nokian } = await insertBreweries(ctx.db)
    const stats = await getBrewery({ ...noFilter, minReviewCount: 3 }, byName)
    assertDeepEqual(stats, [nokianStats(nokian)])
  })

  it('filter by max review count', async () => {
    const { lindemans } = await insertBreweries(ctx.db)
    const stats = await getBrewery({ ...noFilter, maxReviewCount: 2 }, byName)
    assertDeepEqual(stats, [lindemansStats(lindemans)])
  })

  it('filter by min review average', async () => {
    const { nokian } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, minReviewAverage: 6.5 },
      byName,
    )
    assertDeepEqual(stats, [nokianStats(nokian)])
  })

  it('filter by max review average', async () => {
    const { lindemans } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, maxReviewAverage: 6.5 },
      byName,
    )
    assertDeepEqual(stats, [lindemansStats(lindemans)])
  })

  it('filter by start time', async () => {
    const { lindemans } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, timeStart: new Date('2024-01-01T00:00:00.000Z') },
      byName,
    )
    assertDeepEqual(stats, [lindemansStats(lindemans)])
  })

  it('filter by end time', async () => {
    const { nokian } = await insertBreweries(ctx.db)
    const stats = await getBrewery(
      { ...noFilter, timeEnd: new Date('2024-01-01T00:00:00.000Z') },
      byName,
    )
    assertDeepEqual(stats, [nokianStats(nokian)])
  })

  it('count reviewed beers', async () => {
    const { salama, brewdog } = await insertCollaboration(ctx.db)
    const stats = await getBrewery(noFilter, byName)
    assertDeepEqual(stats, [
      brewdogStats(brewdog),
      {
        reviewAverage: '6.50',
        reviewCount: '4',
        reviewStandardDeviation: '2.29',
        reviewMedian: '6.00',
        reviewMode: '4',
        reviewedBeerCount: '2',
        breweryId: salama.id,
        breweryName: 'Salama',
        breweryCountry: 'FI',
      },
    ])
  })

  // The brewery filter selects from another table than the unfiltered
  // query, so this also checks what it selects.
  it('filter by brewery keeps the other breweries of its beers', async () => {
    const { salama, brewdog } = await insertCollaboration(ctx.db)
    const stats = await getBrewery({ ...noFilter, brewery: brewdog.id }, byName)
    assertDeepEqual(stats, [
      brewdogStats(brewdog),
      {
        reviewAverage: '7.00',
        reviewCount: '2',
        reviewStandardDeviation: '3.00',
        reviewMedian: '7.00',
        reviewMode: '4',
        reviewedBeerCount: '1',
        breweryId: salama.id,
        breweryName: 'Salama',
        breweryCountry: 'FI',
      },
    ])
  })
})
