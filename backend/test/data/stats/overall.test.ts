import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
import type { Location } from '../../../src/data/location/location.repository.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import type { StatsIdFilter } from '../../../src/data/stats/stats-filter.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as storageRepository from '../../../src/data/storage/storage.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import * as overallStatsRepository from '../../../src/data/stats/overall.repository.js'
import { assertDeepEqual, assertEqual, assertRejects } from '../../assert.js'
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
  location: Location | undefined
}

interface ReviewedBeer {
  beer: Beer
  brewery: Brewery
  container: Container
  location: Location
  style: Style
}

// A beer of a brewery, a style and a container of its own, reviewed at a
// location of its own or at none, so that filtering by its brewery, style
// or location leaves none of the other beer. Brewery, style and location
// names are unique, and so are container type and size, so the caller
// names them.
async function insertReviewedBeer(
  trx: Transaction,
  names: {
    brewery: string
    style: string
    location: string
    container: { type: string; size: string }
  },
  ratings: (location: Location) => Rating[],
): Promise<ReviewedBeer> {
  const brewery = await breweryRepository.insertBrewery(
    trx,
    buildNewBrewery({ name: names.brewery }),
  )
  const style = await styleRepository.insertStyle(
    trx,
    buildNewStyle({ name: names.style }),
  )
  const location = await locationRepository.insertLocation(
    trx,
    buildNewLocation({ name: names.location }),
  )
  const container = await containerRepository.insertContainer(
    trx,
    buildNewContainer(names.container),
  )
  const beer = await beerRepository.insertBeer(trx, buildNewBeer())
  await beerRepository.insertBeerBreweries(trx, [
    { beer: beer.id, brewery: brewery.id },
  ])
  await beerRepository.insertBeerStyles(trx, [
    { beer: beer.id, style: style.id },
  ])
  await Promise.all(
    ratings(location).map(({ rating, location: reviewLocation }) =>
      reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer: beer.id,
          container: container.id,
          // A review without a location has an empty one.
          location: reviewLocation?.id ?? '',
          rating,
        }),
      ),
    ),
  )
  return { beer, brewery, container, location, style }
}

// The kriek is rated 5 and 7 at Kuja and 6 at no location, the IPA 4, 7
// and 10 at Oluthuone.
async function insertBeers(
  db: Database,
): Promise<{ kriek: ReviewedBeer; ipa: ReviewedBeer }> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const kriek = await insertReviewedBeer(
      trx,
      {
        brewery: 'Lindemans',
        style: 'Kriek',
        location: 'Kuja',
        container: { type: 'bottle', size: '0.33' },
      },
      (kuja) => [
        { rating: 5, location: kuja },
        { rating: 7, location: kuja },
        { rating: 6, location: undefined },
      ],
    )
    const ipa = await insertReviewedBeer(
      trx,
      {
        brewery: 'Nokian Panimo',
        style: 'IPA',
        location: 'Oluthuone',
        container: { type: 'can', size: '0.44' },
      },
      (oluthuone) => [
        { rating: 4, location: oluthuone },
        { rating: 7, location: oluthuone },
        { rating: 10, location: oluthuone },
      ],
    )
    return { kriek, ipa }
  })
}

// The counts of a filter that keeps one of the two beers.
const oneBeerCounts = {
  beerCount: '1',
  breweryCount: '1',
  breweryCountryCount: '0',
  containerCount: '1',
  locationCount: '1',
  distinctBeerReviewCount: '1',
  styleCount: '1',
}

describe('overall stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('shows overall stats', async () => {
    await insertBeers(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, noFilter)

    assertDeepEqual(stats, {
      beerCount: '2',
      breweryCount: '2',
      breweryCountryCount: '0',
      containerCount: '2',
      locationCount: '2',
      distinctBeerReviewCount: '2',
      reviewAverage: '6.50',
      reviewCount: '6',
      reviewStandardDeviation: '1.89',
      reviewMedian: '6.50',
      reviewMode: '7',
      reviewWithLocationCount: '5',
      reviewWithoutLocationCount: '1',
      styleCount: '2',
    })
  })

  it('shows overall by brewery', async () => {
    const { kriek } = await insertBeers(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, {
      ...noFilter,
      brewery: kriek.brewery.id,
    })

    assertDeepEqual(stats, {
      ...oneBeerCounts,
      reviewAverage: '6.00',
      reviewCount: '3',
      reviewStandardDeviation: '0.82',
      reviewMedian: '6.00',
      // Every rating occurs once, and the lowest of a tie wins.
      reviewMode: '5',
      reviewWithLocationCount: '2',
      reviewWithoutLocationCount: '1',
    })
  })

  it('shows overall by location', async () => {
    const { kriek } = await insertBeers(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, {
      ...noFilter,
      location: kriek.location.id,
    })

    assertDeepEqual(stats, {
      ...oneBeerCounts,
      reviewAverage: '6.00',
      reviewCount: '2',
      reviewStandardDeviation: '1.00',
      reviewMedian: '6.00',
      reviewMode: '5',
      reviewWithLocationCount: '2',
      reviewWithoutLocationCount: '0',
    })
  })

  it('shows overall by style', async () => {
    const { ipa } = await insertBeers(ctx.db)

    const stats = await overallStatsRepository.getOverall(ctx.db, {
      ...noFilter,
      style: ipa.style.id,
    })

    assertDeepEqual(stats, {
      ...oneBeerCounts,
      reviewAverage: '7.00',
      reviewCount: '3',
      reviewStandardDeviation: '2.45',
      reviewMedian: '7.00',
      reviewMode: '4',
      reviewWithLocationCount: '3',
      reviewWithoutLocationCount: '0',
    })
  })

  it('counts distinct brewery countries', async () => {
    const { kriek, ipa } = await insertBeers(ctx.db)

    async function setCountries(
      kriekCountry: string | undefined,
      ipaCountry: string | undefined,
    ) {
      await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
        await breweryRepository.updateBrewery(trx, {
          ...kriek.brewery,
          country: kriekCountry,
        })
        await breweryRepository.updateBrewery(trx, {
          ...ipa.brewery,
          country: ipaCountry,
        })
      })
    }

    async function countryCounts(statsFilter: StatsIdFilter) {
      const stats = await overallStatsRepository.getOverall(ctx.db, statsFilter)
      return {
        breweryCount: stats.breweryCount,
        breweryCountryCount: stats.breweryCountryCount,
      }
    }

    await setCountries('FI', 'GB')
    assertDeepEqual(await countryCounts(noFilter), {
      breweryCount: '2',
      breweryCountryCount: '2',
    })
    assertDeepEqual(
      await countryCounts({ ...noFilter, brewery: kriek.brewery.id }),
      { breweryCount: '1', breweryCountryCount: '1' },
    )
    assertDeepEqual(
      await countryCounts({ ...noFilter, location: kriek.location.id }),
      { breweryCount: '1', breweryCountryCount: '1' },
    )
    assertDeepEqual(await countryCounts({ ...noFilter, style: ipa.style.id }), {
      breweryCount: '1',
      breweryCountryCount: '1',
    })

    // Two breweries of the same country count as one country.
    await setCountries('FI', 'FI')
    assertDeepEqual(await countryCounts(noFilter), {
      breweryCount: '2',
      breweryCountryCount: '1',
    })

    // One country set, one left out: null is not counted.
    await setCountries('FI', undefined)
    assertDeepEqual(await countryCounts(noFilter), {
      breweryCount: '2',
      breweryCountryCount: '1',
    })
  })

  // A beer's containers are counted from its reviews and its storages
  // both, so a storage in a container the beer was never reviewed in adds
  // to the count. The brewery and the style variants count them; the
  // location one does not, as a storage has no location.
  it('counts a storage container of a brewery and of a style', async () => {
    const { kriek, ipa } = await insertBeers(ctx.db)
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await storageRepository.insertStorage(trx, {
        beer: kriek.beer.id,
        bestBefore: '2024-12-01T00:00:00.000Z',
        container: ipa.container.id,
      })
    })

    async function containerCount(statsFilter: StatsIdFilter) {
      const stats = await overallStatsRepository.getOverall(ctx.db, statsFilter)
      return stats.containerCount
    }

    assertEqual(
      await containerCount({ ...noFilter, brewery: kriek.brewery.id }),
      '2',
    )
    assertEqual(
      await containerCount({ ...noFilter, style: kriek.style.id }),
      '2',
    )

    // The IPA has no storage, so its count is unaffected.
    assertEqual(
      await containerCount({ ...noFilter, brewery: ipa.brewery.id }),
      '1',
    )
  })

  it('throws on overall by multiple filters', async () => {
    const { kriek } = await insertBeers(ctx.db)
    await assertRejects(
      async () => {
        await overallStatsRepository.getOverall(ctx.db, {
          ...noFilter,
          brewery: kriek.brewery.id,
          style: kriek.style.id,
        })
      },
      new Error(
        'Multiple filters of brewery, location and style not supported',
      ),
      Error,
    )
  })
})
