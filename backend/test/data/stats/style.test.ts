import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type { Location } from '../../../src/data/location/location.repository.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import type { StyleStatsOrder } from '../../../src/data/stats/style.repository.js'
import type { StatsFilter } from '../../../src/data/stats/stats-filter.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import * as styleStatsRepository from '../../../src/data/stats/style.repository.js'
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

interface ReviewedStyle {
  brewery: Brewery
  location: Location
  style: Style
}

// A style with one beer of a brewery of its own, reviewed at a location of
// its own, so that filtering by the style, the brewery or the location
// keeps exactly this style. Brewery, style and location names are unique,
// so the caller names them.
async function insertReviewedStyle(
  trx: Transaction,
  container: Container,
  names: { style: string; brewery: string; location: string },
  ratings: Rating[],
): Promise<ReviewedStyle> {
  const [style, brewery, location, beer] = await Promise.all([
    styleRepository.insertStyle(trx, buildNewStyle({ name: names.style })),
    breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: names.brewery }),
    ),
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

// Gueuze comes before IPA by name and has fewer reviews, a lower average
// and a lower deviation, so every order puts Gueuze first ascending and
// IPA first descending. The reviews of Gueuze are from 2024 and those of
// IPA from 2023, so a time filter keeps one of them.
async function insertStyles(
  db: Database,
): Promise<{ gueuze: ReviewedStyle; ipa: ReviewedStyle }> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const container = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )
    const [gueuze, ipa] = await Promise.all([
      insertReviewedStyle(
        trx,
        container,
        { style: 'Gueuze', brewery: 'Cantillon', location: 'Kuja' },
        [
          { rating: 5, time: new Date('2024-03-01T18:00:00.000Z') },
          { rating: 7, time: new Date('2024-04-01T18:00:00.000Z') },
        ],
      ),
      insertReviewedStyle(
        trx,
        container,
        { style: 'IPA', brewery: 'Nokian Panimo', location: 'Oluthuone' },
        [
          { rating: 4, time: new Date('2023-03-01T18:00:00.000Z') },
          { rating: 7, time: new Date('2023-04-01T18:00:00.000Z') },
          { rating: 10, time: new Date('2023-05-01T18:00:00.000Z') },
        ],
      ),
    ])
    return { gueuze, ipa }
  })
}

function gueuzeStats(gueuze: ReviewedStyle) {
  return {
    reviewAverage: '6.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '6.00',
    reviewMode: '5',
    styleId: gueuze.style.id,
    styleName: 'Gueuze',
  }
}

function ipaStats(ipa: ReviewedStyle) {
  return {
    reviewAverage: '7.00',
    reviewCount: '3',
    reviewStandardDeviation: '2.45',
    reviewMedian: '7.00',
    // Every rating occurs once, and the lowest of a tie wins.
    reviewMode: '4',
    styleId: ipa.style.id,
    styleName: 'IPA',
  }
}

interface MultiStyle {
  ale: Style
  lager: Style
}

// An ale beer is an ale only, a cream ale beer both an ale and a lager. The
// ale beer is rated 5 and 7, the cream ale beer 4 and 10.
async function insertMultiStyle(db: Database): Promise<MultiStyle> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const [ale, lager, aleBeer, creamAleBeer] = await Promise.all([
      styleRepository.insertStyle(trx, buildNewStyle({ name: 'Ale' })),
      styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lager' })),
      beerRepository.insertBeer(trx, buildNewBeer()),
      beerRepository.insertBeer(trx, buildNewBeer()),
    ])
    const [container, location] = await Promise.all([
      containerRepository.insertContainer(trx, buildNewContainer()),
      locationRepository.insertLocation(trx, buildNewLocation()),
      beerRepository.insertBeerStyles(trx, [
        { beer: aleBeer.id, style: ale.id },
        { beer: creamAleBeer.id, style: ale.id },
        { beer: creamAleBeer.id, style: lager.id },
      ]),
    ])
    const ratings = [
      { beer: aleBeer, rating: 5 },
      { beer: aleBeer, rating: 7 },
      { beer: creamAleBeer, rating: 4 },
      { beer: creamAleBeer, rating: 10 },
    ]
    await Promise.all(
      ratings.map(({ beer, rating }) =>
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
    )
    return { ale, lager }
  })
}

function lagerStats(lager: Style) {
  return {
    reviewAverage: '7.00',
    reviewCount: '2',
    reviewStandardDeviation: '3.00',
    reviewMedian: '7.00',
    reviewMode: '4',
    styleId: lager.id,
    styleName: 'Lager',
  }
}

describe('style stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function getStyle(
    filter: StatsFilter,
    order: StyleStatsOrder,
  ): ReturnType<typeof styleStatsRepository.getStyle> {
    return await styleStatsRepository.getStyle(ctx.db, filter, order)
  }

  const orderProperties: StyleStatsOrder['property'][] = [
    'average',
    'count',
    'std_dev',
    'style_name',
  ]

  orderProperties.forEach((property) => {
    it(`by ${property} asc`, async () => {
      const { gueuze, ipa } = await insertStyles(ctx.db)
      const stats = await getStyle(noFilter, { property, direction: 'asc' })
      assertDeepEqual(stats, [gueuzeStats(gueuze), ipaStats(ipa)])
    })

    it(`by ${property} desc`, async () => {
      const { gueuze, ipa } = await insertStyles(ctx.db)
      const stats = await getStyle(noFilter, { property, direction: 'desc' })
      assertDeepEqual(stats, [ipaStats(ipa), gueuzeStats(gueuze)])
    })
  })

  const byName: StyleStatsOrder = { property: 'style_name', direction: 'asc' }

  it('filter by brewery', async () => {
    const { ipa } = await insertStyles(ctx.db)
    const stats = await getStyle(
      { ...noFilter, brewery: ipa.brewery.id },
      byName,
    )
    assertDeepEqual(stats, [ipaStats(ipa)])
  })

  it('filter by location', async () => {
    const { ipa } = await insertStyles(ctx.db)
    const stats = await getStyle(
      { ...noFilter, location: ipa.location.id },
      byName,
    )
    assertDeepEqual(stats, [ipaStats(ipa)])
  })

  it('filter by style', async () => {
    const { gueuze } = await insertStyles(ctx.db)
    const stats = await getStyle(
      { ...noFilter, style: gueuze.style.id },
      byName,
    )
    assertDeepEqual(stats, [gueuzeStats(gueuze)])
  })

  it('filter by min review count', async () => {
    const { ipa } = await insertStyles(ctx.db)
    const stats = await getStyle({ ...noFilter, minReviewCount: 3 }, byName)
    assertDeepEqual(stats, [ipaStats(ipa)])
  })

  it('filter by max review count', async () => {
    const { gueuze } = await insertStyles(ctx.db)
    const stats = await getStyle({ ...noFilter, maxReviewCount: 2 }, byName)
    assertDeepEqual(stats, [gueuzeStats(gueuze)])
  })

  it('filter by min review average', async () => {
    const { ipa } = await insertStyles(ctx.db)
    const stats = await getStyle({ ...noFilter, minReviewAverage: 6.5 }, byName)
    assertDeepEqual(stats, [ipaStats(ipa)])
  })

  it('filter by max review average', async () => {
    const { gueuze } = await insertStyles(ctx.db)
    const stats = await getStyle({ ...noFilter, maxReviewAverage: 6.5 }, byName)
    assertDeepEqual(stats, [gueuzeStats(gueuze)])
  })

  it('filter by start time', async () => {
    const { gueuze } = await insertStyles(ctx.db)
    const stats = await getStyle(
      { ...noFilter, timeStart: new Date('2024-01-01T00:00:00.000Z') },
      byName,
    )
    assertDeepEqual(stats, [gueuzeStats(gueuze)])
  })

  it('filter by end time', async () => {
    const { ipa } = await insertStyles(ctx.db)
    const stats = await getStyle(
      { ...noFilter, timeEnd: new Date('2024-01-01T00:00:00.000Z') },
      byName,
    )
    assertDeepEqual(stats, [ipaStats(ipa)])
  })

  it('count a review into each style of its beer', async () => {
    const { ale, lager } = await insertMultiStyle(ctx.db)
    const stats = await getStyle(noFilter, byName)
    assertDeepEqual(stats, [
      {
        reviewAverage: '6.50',
        reviewCount: '4',
        reviewStandardDeviation: '2.29',
        reviewMedian: '6.00',
        reviewMode: '4',
        styleId: ale.id,
        styleName: 'Ale',
      },
      lagerStats(lager),
    ])
  })

  // The style filter selects from another table than the unfiltered query,
  // so this also checks what it selects.
  it('filter by style keeps the other styles of its beers', async () => {
    const { ale, lager } = await insertMultiStyle(ctx.db)
    const stats = await getStyle({ ...noFilter, style: lager.id }, byName)
    assertDeepEqual(stats, [
      {
        reviewAverage: '7.00',
        reviewCount: '2',
        reviewStandardDeviation: '3.00',
        reviewMedian: '7.00',
        reviewMode: '4',
        styleId: ale.id,
        styleName: 'Ale',
      },
      lagerStats(lager),
    ])
  })
})
