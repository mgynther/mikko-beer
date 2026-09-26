import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Database, Transaction } from '../../../src/data/database.js'
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Location } from '../../../src/data/location/location.repository.js'
import type { Style } from '../../../src/data/style/style.repository.js'
import * as beerRepository from '../../../src/data/beer/beer.repository.js'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository.js'
import * as containerRepository from '../../../src/data/container/container.repository.js'
import * as locationRepository from '../../../src/data/location/location.repository.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import * as styleRepository from '../../../src/data/style/style.repository.js'
import type {
  FullReviewListOrder,
  JoinedReview,
  Review,
  ReviewListFilter,
  ReviewListOrder,
} from '../../../src/data/review/review.repository.js'
import { assertDeepEqual } from '../../assert.js'
import { buildNewBeer } from '../beer/builders.js'
import { buildNewBrewery } from '../brewery/builders.js'
import { buildNewContainer } from '../container/builders.js'
import { buildNewLocation } from '../location/builders.js'
import { buildNewReview } from '../review/builders.js'
import { buildNewStyle } from '../style/builders.js'

// Lets every review through, so that a test filters by what it sets.
const noFilter: ReviewListFilter = {
  minRating: 4,
  maxRating: 10,
  minTime: new Date('1970-01-01'),
  maxTime: new Date('9999-01-01'),
}

interface Reviews {
  kriek1: Review
  kriek2: Review
  faro: Review
  ipa1: Review
  ipa2: Review
  ipa3: Review
}

interface Scenario {
  reviews: Reviews
  ipa: Beer
  lindemans: Brewery
  kuja: Location
  lambic: Style
}

// Lindemans brews Kriek and Faro, both lambics, and Nokian Panimo brews
// IPA.
//
//   review  beer   location   rating  time
//   kriek1  Kriek  Kuja       8       2023-02-01
//   kriek2  Kriek  Oluthuone  5       2024-03-01
//   faro    Faro   Kuja       6       2024-01-15
//   ipa1    IPA    Kuja       9       2023-06-01
//   ipa2    IPA    Oluthuone  5       2024-05-01
//   ipa3    IPA    Kuja       7       2022-11-01
//
// Beer names sort Faro, IPA, Kriek and brewery names Lindemans, Nokian
// Panimo. kriek2 and ipa2 share a rating, so their time breaks the tie.
async function insertScenario(db: Database): Promise<Scenario> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const lindemans = await breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: 'Lindemans' }),
    )
    const nokian = await breweryRepository.insertBrewery(
      trx,
      buildNewBrewery({ name: 'Nokian Panimo' }),
    )
    const lambic = await styleRepository.insertStyle(
      trx,
      buildNewStyle({ name: 'Lambic' }),
    )
    const ipaStyle = await styleRepository.insertStyle(
      trx,
      buildNewStyle({ name: 'IPA' }),
    )
    const kuja = await locationRepository.insertLocation(
      trx,
      buildNewLocation({ name: 'Kuja' }),
    )
    const oluthuone = await locationRepository.insertLocation(
      trx,
      buildNewLocation({ name: 'Oluthuone' }),
    )
    const container = await containerRepository.insertContainer(
      trx,
      buildNewContainer(),
    )

    async function insertBeer(
      name: string,
      brewery: Brewery,
      style: Style,
    ): Promise<Beer> {
      const beer = await beerRepository.insertBeer(trx, buildNewBeer({ name }))
      await beerRepository.insertBeerBreweries(trx, [
        { beer: beer.id, brewery: brewery.id },
      ])
      await beerRepository.insertBeerStyles(trx, [
        { beer: beer.id, style: style.id },
      ])
      return beer
    }
    const kriek = await insertBeer('Kriek', lindemans, lambic)
    const faro = await insertBeer('Faro', lindemans, lambic)
    const ipa = await insertBeer('IPA', nokian, ipaStyle)

    async function insertReview(
      beer: Beer,
      location: Location,
      rating: number,
      time: string,
    ): Promise<Review> {
      return await reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer: beer.id,
          container: container.id,
          location: location.id,
          rating,
          time: new Date(time),
        }),
      )
    }
    const reviews: Reviews = {
      kriek1: await insertReview(kriek, kuja, 8, '2023-02-01T18:00:00.000Z'),
      kriek2: await insertReview(
        kriek,
        oluthuone,
        5,
        '2024-03-01T18:00:00.000Z',
      ),
      faro: await insertReview(faro, kuja, 6, '2024-01-15T18:00:00.000Z'),
      ipa1: await insertReview(ipa, kuja, 9, '2023-06-01T18:00:00.000Z'),
      ipa2: await insertReview(ipa, oluthuone, 5, '2024-05-01T18:00:00.000Z'),
      ipa3: await insertReview(ipa, kuja, 7, '2022-11-01T18:00:00.000Z'),
    }
    return { reviews, ipa, lindemans, kuja, lambic }
  })
}

function ids(reviews: Array<Review | JoinedReview>): string[] {
  return reviews.map((review) => review.id)
}

interface ListCase<Order> {
  filter: Partial<ReviewListFilter>
  order: Order
  expected: (reviews: Reviews) => Review[]
}

function title(
  listing: string,
  { filter, order }: ListCase<ReviewListOrder>,
): string {
  const filterNames: Array<[keyof ReviewListFilter, string]> = [
    ['minRating', 'min rating'],
    ['maxRating', 'max rating'],
    ['minTime', 'min time'],
    ['maxTime', 'max time'],
  ]
  const filtered = filterNames
    .filter(([key]) => filter[key] !== undefined)
    .map(([, name]) => ` and ${name}`)
    .join('')
  return `${listing}${filtered}, ${order.property} ${order.direction}`
}

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('insert a review', async () => {
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      const beer = await beerRepository.insertBeer(trx, buildNewBeer())
      const container = await containerRepository.insertContainer(
        trx,
        buildNewContainer(),
      )
      const location = await locationRepository.insertLocation(
        trx,
        buildNewLocation(),
      )
      const reviewRequest = buildNewReview({
        beer: beer.id,
        container: container.id,
        location: location.id,
      })
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      assertDeepEqual(review, {
        ...reviewRequest,
        id: review.id,
      })
    })
  })

  const listCases: Array<ListCase<FullReviewListOrder>> = [
    {
      filter: {},
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.ipa3, r.kriek1, r.ipa1, r.faro, r.kriek2, r.ipa2],
    },
    {
      filter: { minRating: 8 },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.kriek1, r.ipa1],
    },
    {
      filter: { maxRating: 7 },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.ipa3, r.faro, r.kriek2, r.ipa2],
    },
    {
      filter: { minTime: new Date('2024-01-01T00:00:00.000Z') },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek2, r.ipa2],
    },
    {
      filter: { maxTime: new Date('2023-03-01T00:00:00.000Z') },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.ipa3, r.kriek1],
    },
    {
      filter: {},
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.ipa2, r.kriek2, r.faro, r.ipa1, r.kriek1, r.ipa3],
    },
    {
      filter: {},
      order: { property: 'rating', direction: 'desc' },
      expected: (r) => [r.ipa1, r.kriek1, r.ipa3, r.faro, r.ipa2, r.kriek2],
    },
    // A tie in rating lists the later review first in both directions.
    {
      filter: {},
      order: { property: 'rating', direction: 'asc' },
      expected: (r) => [r.ipa2, r.kriek2, r.faro, r.ipa3, r.kriek1, r.ipa1],
    },
  ]

  listCases.forEach((listCase) =>
    it(title('list reviews', listCase), async () => {
      const { reviews } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviews(
        ctx.db,
        { size: 50, skip: 0 },
        { filter: { ...noFilter, ...listCase.filter }, order: listCase.order },
      )
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )

  const byBeerCases: Array<ListCase<ReviewListOrder>> = [
    // All reviews are of the one beer, so its name leaves them by time.
    {
      filter: {},
      order: { property: 'beer_name', direction: 'desc' },
      expected: (r) => [r.ipa3, r.ipa1, r.ipa2],
    },
    {
      filter: { minRating: 7 },
      order: { property: 'beer_name', direction: 'desc' },
      expected: (r) => [r.ipa3, r.ipa1],
    },
    {
      filter: { maxRating: 8 },
      order: { property: 'beer_name', direction: 'desc' },
      expected: (r) => [r.ipa3, r.ipa2],
    },
    {
      filter: { minTime: new Date('2023-01-01T00:00:00.000Z') },
      order: { property: 'beer_name', direction: 'desc' },
      expected: (r) => [r.ipa1, r.ipa2],
    },
    {
      filter: { maxTime: new Date('2023-12-31T00:00:00.000Z') },
      order: { property: 'beer_name', direction: 'desc' },
      expected: (r) => [r.ipa3, r.ipa1],
    },
    {
      filter: {},
      order: { property: 'rating', direction: 'asc' },
      expected: (r) => [r.ipa2, r.ipa3, r.ipa1],
    },
    {
      filter: {},
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.ipa2, r.ipa1, r.ipa3],
    },
  ]

  byBeerCases.forEach((listCase) =>
    it(title('list reviews by IPA', listCase), async () => {
      const { reviews, ipa } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviewsByBeer(ctx.db, ipa.id, {
        filter: { ...noFilter, ...listCase.filter },
        order: listCase.order,
      })
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )

  const byBreweryCases: Array<ListCase<ReviewListOrder>> = [
    {
      filter: {},
      order: { property: 'beer_name', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek1, r.kriek2],
    },
    {
      filter: {},
      order: { property: 'rating', direction: 'desc' },
      expected: (r) => [r.kriek1, r.faro, r.kriek2],
    },
    {
      filter: {},
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.kriek1, r.faro, r.kriek2],
    },
    {
      filter: { minRating: 6 },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.kriek1, r.faro],
    },
    {
      filter: { maxRating: 6 },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek2],
    },
    {
      filter: { minTime: new Date('2024-01-01T00:00:00.000Z') },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek2],
    },
    {
      filter: { maxTime: new Date('2023-12-31T00:00:00.000Z') },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.kriek1],
    },
  ]

  byBreweryCases.forEach((listCase) =>
    it(title('list reviews by Lindemans', listCase), async () => {
      const { reviews, lindemans } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviewsByBrewery(
        ctx.db,
        lindemans.id,
        { filter: { ...noFilter, ...listCase.filter }, order: listCase.order },
      )
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )

  const byLocationCases: Array<ListCase<ReviewListOrder>> = [
    {
      filter: {},
      order: { property: 'beer_name', direction: 'asc' },
      expected: (r) => [r.faro, r.ipa3, r.ipa1, r.kriek1],
    },
    {
      filter: {},
      order: { property: 'brewery_name', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek1, r.ipa3, r.ipa1],
    },
    {
      filter: {},
      order: { property: 'rating', direction: 'desc' },
      expected: (r) => [r.ipa1, r.kriek1, r.ipa3, r.faro],
    },
    {
      filter: {},
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.ipa3, r.kriek1, r.ipa1, r.faro],
    },
    {
      filter: { minRating: 8 },
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.ipa1, r.kriek1],
    },
    {
      filter: { maxRating: 7 },
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.faro, r.ipa3],
    },
    {
      filter: { minTime: new Date('2023-03-01T00:00:00.000Z') },
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.faro, r.ipa1],
    },
    {
      filter: { maxTime: new Date('2023-12-31T00:00:00.000Z') },
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.ipa1, r.kriek1, r.ipa3],
    },
  ]

  byLocationCases.forEach((listCase) =>
    it(title('list reviews by Kuja', listCase), async () => {
      const { reviews, kuja } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviewsByLocation(
        ctx.db,
        kuja.id,
        { filter: { ...noFilter, ...listCase.filter }, order: listCase.order },
      )
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )

  const byStyleCases: Array<ListCase<ReviewListOrder>> = [
    {
      filter: {},
      order: { property: 'beer_name', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek1, r.kriek2],
    },
    {
      filter: {},
      order: { property: 'rating', direction: 'desc' },
      expected: (r) => [r.kriek1, r.faro, r.kriek2],
    },
    {
      filter: { minRating: 6 },
      order: { property: 'rating', direction: 'asc' },
      expected: (r) => [r.faro, r.kriek1],
    },
    {
      filter: { maxRating: 6 },
      order: { property: 'rating', direction: 'asc' },
      expected: (r) => [r.kriek2, r.faro],
    },
    {
      filter: { minTime: new Date('2024-01-01T00:00:00.000Z') },
      order: { property: 'rating', direction: 'asc' },
      expected: (r) => [r.kriek2, r.faro],
    },
    {
      filter: { maxTime: new Date('2023-12-31T00:00:00.000Z') },
      order: { property: 'rating', direction: 'asc' },
      expected: (r) => [r.kriek1],
    },
    {
      filter: {},
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.kriek1, r.faro, r.kriek2],
    },
  ]

  byStyleCases.forEach((listCase) =>
    it(title('list reviews by Lambic', listCase), async () => {
      const { reviews, lambic } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviewsByStyle(
        ctx.db,
        lambic.id,
        { filter: { ...noFilter, ...listCase.filter }, order: listCase.order },
      )
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )
})
