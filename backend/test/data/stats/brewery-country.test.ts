import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { Pagination } from '../../../src/data/pagination.js'
import type { BreweryCountryStatsOrder } from '../../../src/data/stats/brewery-country.repository.js'
import type { StatsFilter } from '../../../src/data/stats/stats-filter.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import * as breweryCountryStatsRepository from '../../../src/data/stats/brewery-country.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'
import { buildNewStyle } from '../style/builders.js'

const giantPage: Pagination = { size: 10000, skip: 0 }

const defaultFilter: StatsFilter = {
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

const byCountryCode: BreweryCountryStatsOrder = {
  property: 'country_code',
  direction: 'asc',
}

//   fiOne (FI)    -> fiBeer, collab
//   fiTwo (FI)    -> collab
//   be    (BE)    -> beBeer, collab
//   unknown (n/a) -> unknownBeer
//
// collab is the point of the fixture: one review of it must count once
// into FI and once into BE, not twice into FI.
interface Ids {
  fiOne: string
  fiTwo: string
  be: string
  unknown: string
  fiBeer: string
  beBeer: string
  collab: string
  unknownBeer: string
  lager: string
  ipa: string
  bar: string
  home: string
}

async function insertFixture(db: Database): Promise<Ids> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    function brewery(
      name: string,
      country: string | undefined,
    ): Promise<beerRepository.Brewery> {
      return breweryRepository.insertBrewery(
        trx,
        buildNewBrewery({ name, country }),
      )
    }
    const fiOnePromise = brewery('Sonnisaari', 'FI')
    const fiTwoPromise = brewery('Mallaskoski', 'FI')
    const bePromise = brewery('Cantillon', 'BE')
    const unknownPromise = brewery('Unknown Origin', undefined)

    const lagerPromise = styleRepository.insertStyle(
      trx,
      buildNewStyle({ name: 'Lager' }),
    )
    const ipaPromise = styleRepository.insertStyle(
      trx,
      buildNewStyle({ name: 'IPA' }),
    )

    const [fiOne, fiTwo, be, unknown, lager, ipa] = await Promise.all([
      fiOnePromise,
      fiTwoPromise,
      bePromise,
      unknownPromise,
      lagerPromise,
      ipaPromise,
    ])

    async function beer(
      breweries: string[],
      style: string,
    ): Promise<beerRepository.Beer> {
      const inserted = await beerRepository.insertBeer(trx, buildNewBeer())
      await Promise.all([
        beerRepository.insertBeerBreweries(
          trx,
          breweries.map((id) => ({ beer: inserted.id, brewery: id })),
        ),
        beerRepository.insertBeerStyles(trx, [{ beer: inserted.id, style }]),
      ])
      return inserted
    }
    const fiBeerPromise = beer([fiOne.id], lager.id)
    const beBeerPromise = beer([be.id], lager.id)
    const collabPromise = beer([fiOne.id, fiTwo.id, be.id], ipa.id)
    const unknownBeerPromise = beer([unknown.id], lager.id)

    const barPromise = locationRepository.insertLocation(
      trx,
      buildNewLocation({ name: 'bar' }),
    )
    const homePromise = locationRepository.insertLocation(
      trx,
      buildNewLocation({ name: 'home' }),
    )

    const [fiBeer, beBeer, collab, unknownBeer, bar, home] = await Promise.all([
      fiBeerPromise,
      beBeerPromise,
      collabPromise,
      unknownBeerPromise,
      barPromise,
      homePromise,
    ])

    return {
      fiOne: fiOne.id,
      fiTwo: fiTwo.id,
      be: be.id,
      unknown: unknown.id,
      fiBeer: fiBeer.id,
      beBeer: beBeer.id,
      collab: collab.id,
      unknownBeer: unknownBeer.id,
      lager: lager.id,
      ipa: ipa.id,
      bar: bar.id,
      home: home.id,
    }
  })
}

async function insertReviews(db: Database, ids: Ids): Promise<void> {
  await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const { id: containerId } = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )
    async function review(
      beer: string,
      rating: number,
      location: string,
      time: string,
    ) {
      await reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer,
          container: containerId,
          location,
          rating,
          time: new Date(time),
        }),
      )
    }
    await Promise.all([
      review(ids.fiBeer, 8, ids.bar, '2024-01-01T18:00:00.000Z'),
      review(ids.fiBeer, 6, ids.home, '2024-02-01T18:00:00.000Z'),
      review(ids.beBeer, 5, ids.bar, '2023-01-01T18:00:00.000Z'),
      review(ids.collab, 10, ids.bar, '2024-03-01T18:00:00.000Z'),
      review(ids.unknownBeer, 4, ids.home, '2024-04-01T18:00:00.000Z'),
    ])
  })
}

interface RatingStats {
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
}

// The statistics of each set of ratings a row is expected to have. On a
// tie the mode is the lowest of the tied ratings.
const statsOf = {
  '5': {
    reviewAverage: '5.00',
    reviewCount: '1',
    reviewStandardDeviation: '0.00',
    reviewMedian: '5.00',
    reviewMode: '5',
  },
  '10': {
    reviewAverage: '10.00',
    reviewCount: '1',
    reviewStandardDeviation: '0.00',
    reviewMedian: '10.00',
    reviewMode: '10',
  },
  '5, 10': {
    reviewAverage: '7.50',
    reviewCount: '2',
    reviewStandardDeviation: '2.50',
    reviewMedian: '7.50',
    reviewMode: '5',
  },
  '8, 6': {
    reviewAverage: '7.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '7.00',
    reviewMode: '6',
  },
  '8, 10': {
    reviewAverage: '9.00',
    reviewCount: '2',
    reviewStandardDeviation: '1.00',
    reviewMedian: '9.00',
    reviewMode: '8',
  },
  '8, 6, 10': {
    reviewAverage: '8.00',
    reviewCount: '3',
    reviewStandardDeviation: '1.63',
    reviewMedian: '8.00',
    reviewMode: '6',
  },
}

function row(
  countryCode: string,
  ratingStats: RatingStats,
  reviewedBeerCount: number,
  breweryCount: number,
) {
  return {
    ...ratingStats,
    reviewedBeerCount: `${reviewedBeerCount}`,
    breweryCount: `${breweryCount}`,
    countryCode,
  }
}

// With no filters: FI has fiBeer's 8 and 6 plus collab's 10, BE has
// beBeer's 5 plus the same collab 10. The collaboration review appears
// once on each side although FI has two of its three breweries.
const allFi = row('FI', statsOf['8, 6, 10'], 2, 2)
const allBe = row('BE', statsOf['5, 10'], 2, 1)

suite('brewery country stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // The fixture goes in once per test; a test that queries it several
  // times must not insert it again.
  async function insertAll(): Promise<Ids> {
    const ids = await insertFixture(ctx.db)
    await insertReviews(ctx.db, ids)
    return ids
  }

  async function getStats(
    statsFilter: StatsFilter,
    order: BreweryCountryStatsOrder = byCountryCode,
    pagination: Pagination = giantPage,
  ) {
    return await breweryCountryStatsRepository.getBreweryCountry(
      ctx.db,
      pagination,
      statsFilter,
      order,
    )
  }

  test('counts a collaboration review once per country', async () => {
    await insertAll()
    assertDeepEqual(await getStats(defaultFilter), [allBe, allFi])
  })

  test('leaves out a brewery without a country', async () => {
    await insertAll()
    const stats = await getStats(defaultFilter)
    // unknownBeer was reviewed, but its brewery has no country, so it is
    // in no row and in no row's counts.
    assertDeepEqual(
      stats.map((countryStats) => countryStats.countryCode),
      ['BE', 'FI'],
    )
  })

  interface OrderCase {
    title: string
    property: BreweryCountryStatsOrder['property']
    ascending: object[]
  }

  // Every property separates the two rows, so each case also asserts the
  // direction is applied rather than ignored.
  const orderCases: OrderCase[] = [
    {
      title: 'country code',
      property: 'country_code',
      ascending: [allBe, allFi],
    },
    { title: 'review count', property: 'count', ascending: [allBe, allFi] },
    { title: 'review average', property: 'average', ascending: [allBe, allFi] },
    {
      title: 'brewery count',
      property: 'brewery_count',
      ascending: [allBe, allFi],
    },
    // FI [8, 6, 10] deviates less than BE [5, 10].
    {
      title: 'standard deviation',
      property: 'std_dev',
      ascending: [allFi, allBe],
    },
  ]

  orderCases.forEach(({ title, property, ascending }) => {
    test(`orders by ${title}`, async () => {
      await insertAll()
      assertDeepEqual(
        await getStats(defaultFilter, { property, direction: 'asc' }),
        ascending,
      )
      assertDeepEqual(
        await getStats(defaultFilter, { property, direction: 'desc' }),
        [...ascending].reverse(),
      )
    })
  })

  test('paginates', async () => {
    await insertAll()
    assertDeepEqual(
      await getStats(defaultFilter, byCountryCode, { size: 1, skip: 0 }),
      [allBe],
    )
    assertDeepEqual(
      await getStats(defaultFilter, byCountryCode, { size: 1, skip: 1 }),
      [allFi],
    )
    assertDeepEqual(
      await getStats(defaultFilter, byCountryCode, { size: 10, skip: 5 }),
      [],
    )
  })

  test('filters by brewery', async () => {
    const ids = await insertAll()
    const stats = await getStats({ ...defaultFilter, brewery: ids.fiOne })
    // fiOne brews fiBeer and collab. BE is present through collab only.
    assertDeepEqual(stats, [
      row('BE', statsOf['10'], 1, 1),
      row('FI', statsOf['8, 6, 10'], 2, 2),
    ])
  })

  test('filters by location', async () => {
    const ids = await insertAll()
    const stats = await getStats({ ...defaultFilter, location: ids.bar })
    assertDeepEqual(stats, [
      row('BE', statsOf['5, 10'], 2, 1),
      row('FI', statsOf['8, 10'], 2, 2),
    ])
  })

  test('filters by style', async () => {
    const ids = await insertAll()
    const stats = await getStats({ ...defaultFilter, style: ids.ipa })
    // Only collab is an IPA, and its single review counts once per country.
    assertDeepEqual(stats, [
      row('BE', statsOf['10'], 1, 1),
      row('FI', statsOf['10'], 1, 2),
    ])
  })

  test('filters by time', async () => {
    await insertAll()
    const fromStart = await getStats({
      ...defaultFilter,
      timeStart: new Date('2024-01-01T00:00:00.000Z'),
    })
    // The 2023 review of beBeer drops out, leaving BE with collab only.
    assertDeepEqual(fromStart, [
      row('BE', statsOf['10'], 1, 1),
      row('FI', statsOf['8, 6, 10'], 2, 2),
    ])

    const untilEnd = await getStats({
      ...defaultFilter,
      timeEnd: new Date('2024-02-28T00:00:00.000Z'),
    })
    assertDeepEqual(untilEnd, [
      row('BE', statsOf['5'], 1, 1),
      row('FI', statsOf['8, 6'], 1, 1),
    ])
  })

  test('filters by review count over the deduplicated count', async () => {
    await insertAll()

    async function withCounts(min: number, max: number) {
      return await getStats({
        ...defaultFilter,
        minReviewCount: min,
        maxReviewCount: max,
      })
    }

    assertDeepEqual(await withCounts(3, Infinity), [allFi])
    assertDeepEqual(await withCounts(1, 2), [allBe])
    // FI has three reviews once the collaboration is counted once. A join
    // without the deduplication would give it four and let it through.
    assertDeepEqual(await withCounts(4, Infinity), [])
  })

  test('filters by review average', async () => {
    await insertAll()

    async function withAverages(min: number, max: number) {
      return await getStats({
        ...defaultFilter,
        minReviewAverage: min,
        maxReviewAverage: max,
      })
    }

    assertDeepEqual(await withAverages(8, 10), [allFi])
    assertDeepEqual(await withAverages(4, 7.5), [allBe])
  })
})
