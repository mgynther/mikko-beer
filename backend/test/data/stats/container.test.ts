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
import * as containerStatsRepository from '../../../src/data/stats/container.repository.js'
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

interface ContainerRating {
  container: Container
  rating: number
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
    ...ratings.map(({ container, rating }) =>
      reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer: beer.id,
          container: container.id,
          location: location.id,
          rating,
        }),
      ),
    ),
  ])
  return { brewery, location, style }
}

interface Containers {
  bottle033: Container
  bottle050: Container
  can044: Container
}

// The containers are listed out of order and inserted in no particular
// order, so the order of the stats comes from sorting by type and then
// size. Both beers are reviewed from
// the 0.33 bottle, so filtering by one of them changes its statistics
// rather than just removing it.
async function insertBeers(db: Database): Promise<{
  containers: Containers
  kriek: ReviewedBeer
  ipa: ReviewedBeer
}> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const [can044, bottle050, bottle033] = await Promise.all([
      containerRepository.insertContainer(
        trx,
        buildNewContainer({ type: 'can', size: '0.44' }),
      ),
      containerRepository.insertContainer(
        trx,
        buildNewContainer({ type: 'bottle', size: '0.50' }),
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
          { container: bottle033, rating: 5 },
          { container: bottle033, rating: 7 },
        ],
      ),
      insertReviewedBeer(
        trx,
        { brewery: 'Nokian Panimo', style: 'IPA', location: 'Oluthuone' },
        [
          { container: bottle033, rating: 9 },
          { container: bottle050, rating: 8 },
          { container: can044, rating: 4 },
          { container: can044, rating: 7 },
          { container: can044, rating: 10 },
        ],
      ),
    ])
    return { containers: { bottle033, bottle050, can044 }, kriek, ipa }
  })
}

suite('container stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('no filters', async () => {
    const { containers } = await insertBeers(ctx.db)
    const stats = await containerStatsRepository.getContainer(ctx.db, noFilter)
    assertDeepEqual(stats, [
      {
        containerId: containers.bottle033.id,
        containerSize: '0.33',
        containerType: 'bottle',
        reviewAverage: '7.00',
        reviewCount: '3',
        reviewStandardDeviation: '1.63',
        reviewMedian: '7.00',
        reviewMode: '5',
      },
      {
        containerId: containers.bottle050.id,
        containerSize: '0.50',
        containerType: 'bottle',
        reviewAverage: '8.00',
        reviewCount: '1',
        reviewStandardDeviation: '0.00',
        reviewMedian: '8.00',
        reviewMode: '8',
      },
      {
        containerId: containers.can044.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: '7.00',
        reviewCount: '3',
        reviewStandardDeviation: '2.45',
        reviewMedian: '7.00',
        reviewMode: '4',
      },
    ])
  })

  const kriekBottle033 = (containers: Containers) => ({
    containerId: containers.bottle033.id,
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '6.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '6.00',
    reviewMode: '5',
  })

  test('filter by brewery', async () => {
    const { containers, kriek } = await insertBeers(ctx.db)
    const stats = await containerStatsRepository.getContainer(ctx.db, {
      ...noFilter,
      brewery: kriek.brewery.id,
    })
    assertDeepEqual(stats, [kriekBottle033(containers)])
  })

  test('filter by location', async () => {
    const { containers, kriek } = await insertBeers(ctx.db)
    const stats = await containerStatsRepository.getContainer(ctx.db, {
      ...noFilter,
      location: kriek.location.id,
    })
    assertDeepEqual(stats, [kriekBottle033(containers)])
  })

  test('filter by style', async () => {
    const { containers, ipa } = await insertBeers(ctx.db)
    const stats = await containerStatsRepository.getContainer(ctx.db, {
      ...noFilter,
      style: ipa.style.id,
    })
    assertDeepEqual(stats, [
      {
        containerId: containers.bottle033.id,
        containerSize: '0.33',
        containerType: 'bottle',
        reviewAverage: '9.00',
        reviewCount: '1',
        reviewStandardDeviation: '0.00',
        reviewMedian: '9.00',
        reviewMode: '9',
      },
      {
        containerId: containers.bottle050.id,
        containerSize: '0.50',
        containerType: 'bottle',
        reviewAverage: '8.00',
        reviewCount: '1',
        reviewStandardDeviation: '0.00',
        reviewMedian: '8.00',
        reviewMode: '8',
      },
      {
        containerId: containers.can044.id,
        containerSize: '0.44',
        containerType: 'can',
        reviewAverage: '7.00',
        reviewCount: '3',
        reviewStandardDeviation: '2.45',
        reviewMedian: '7.00',
        reviewMode: '4',
      },
    ])
  })
})
