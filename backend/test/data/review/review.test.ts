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
import type { Beer } from '../../../src/data/beer/beer.repository.js'
import type { Brewery } from '../../../src/data/brewery/brewery.repository.js'
import type { Container } from '../../../src/data/container/container.repository.js'
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
  FullReviewListRequest,
  JoinedReview,
  NewReview,
  Review,
  ReviewListFilter,
  ReviewListOrder,
} from '../../../src/data/review/review.repository.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
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
    const [lindemans, nokian, lambic, ipaStyle, kuja, oluthuone, container] =
      await Promise.all([
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Lindemans' }),
        ),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Nokian Panimo' }),
        ),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lambic' })),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'IPA' })),
        locationRepository.insertLocation(
          trx,
          buildNewLocation({ name: 'Kuja' }),
        ),
        locationRepository.insertLocation(
          trx,
          buildNewLocation({ name: 'Oluthuone' }),
        ),
        containerRepository.insertContainer(trx, buildNewContainer()),
      ])

    async function insertBeer(
      name: string,
      brewery: Brewery,
      style: Style,
    ): Promise<Beer> {
      const beer = await beerRepository.insertBeer(trx, buildNewBeer({ name }))
      await Promise.all([
        beerRepository.insertBeerBreweries(trx, [
          { beer: beer.id, brewery: brewery.id },
        ]),
        beerRepository.insertBeerStyles(trx, [
          { beer: beer.id, style: style.id },
        ]),
      ])
      return beer
    }
    const [kriek, faro, ipa] = await Promise.all([
      insertBeer('Kriek', lindemans, lambic),
      insertBeer('Faro', lindemans, lambic),
      insertBeer('IPA', nokian, ipaStyle),
    ])

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
    const [kriek1, kriek2, faroReview, ipa1, ipa2, ipa3] = await Promise.all([
      insertReview(kriek, kuja, 8, '2023-02-01T18:00:00.000Z'),
      insertReview(kriek, oluthuone, 5, '2024-03-01T18:00:00.000Z'),
      insertReview(faro, kuja, 6, '2024-01-15T18:00:00.000Z'),
      insertReview(ipa, kuja, 9, '2023-06-01T18:00:00.000Z'),
      insertReview(ipa, oluthuone, 5, '2024-05-01T18:00:00.000Z'),
      insertReview(ipa, kuja, 7, '2022-11-01T18:00:00.000Z'),
    ])
    const reviews: Reviews = {
      kriek1,
      kriek2,
      faro: faroReview,
      ipa1,
      ipa2,
      ipa3,
    }
    return { reviews, ipa, lindemans, kuja, lambic }
  })
}

interface Collaboration {
  creamAle: Beer
  breweries: Brewery[]
  styles: Style[]
  container: Container
  kuja: Location
  atKuja: Review
  withoutLocation: Review
}

// Nokian Panimo and Sonnisaari brew a cream ale together, which is both an
// ale and a lager, so a review of it joins to two breweries and two styles.
// It is reviewed at Kuja and later without a location. The breweries and
// styles are linked in reverse order of their names.
async function insertCollaboration(db: Database): Promise<Collaboration> {
  return await db.executeReadWriteTransaction(async (trx: Transaction) => {
    const [nokian, sonnisaari, ale, lager, container, kuja, creamAle] =
      await Promise.all([
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Nokian Panimo' }),
        ),
        breweryRepository.insertBrewery(
          trx,
          buildNewBrewery({ name: 'Sonnisaari' }),
        ),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Ale' })),
        styleRepository.insertStyle(trx, buildNewStyle({ name: 'Lager' })),
        containerRepository.insertContainer(trx, buildNewContainer()),
        locationRepository.insertLocation(
          trx,
          buildNewLocation({ name: 'Kuja' }),
        ),
        beerRepository.insertBeer(trx, buildNewBeer({ name: 'Cream Ale' })),
      ])
    await Promise.all([
      beerRepository.insertBeerBreweries(trx, [
        { beer: creamAle.id, brewery: sonnisaari.id },
        { beer: creamAle.id, brewery: nokian.id },
      ]),
      beerRepository.insertBeerStyles(trx, [
        { beer: creamAle.id, style: lager.id },
        { beer: creamAle.id, style: ale.id },
      ]),
    ])
    const [atKuja, withoutLocation] = await Promise.all([
      reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer: creamAle.id,
          container: container.id,
          location: kuja.id,
          rating: 8,
          time: new Date('2024-05-01T18:00:00.000Z'),
        }),
      ),
      reviewRepository.insertReview(
        trx,
        buildNewReview({
          beer: creamAle.id,
          container: container.id,
          location: '',
          rating: 7,
          time: new Date('2024-06-01T18:00:00.000Z'),
        }),
      ),
    ])
    return {
      creamAle,
      breweries: [nokian, sonnisaari],
      styles: [ale, lager],
      container,
      kuja,
      atKuja,
      withoutLocation,
    }
  })
}

// The review as a list joins it, its breweries and styles by name.
function joined(collaboration: Collaboration, review: Review): JoinedReview {
  const { creamAle, breweries, styles, container, kuja } = collaboration
  return {
    id: review.id,
    additionalInfo: review.additionalInfo,
    beerId: creamAle.id,
    beerName: creamAle.name,
    breweries: breweries.map(({ id, name }) => ({ id, name })),
    container,
    location: review.location === kuja.id ? kuja : undefined,
    rating: review.rating,
    styles,
    time: review.time,
  }
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

suite('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  // What a review refers to, so that it can be inserted.
  async function insertReferred(
    trx: Transaction,
  ): Promise<Pick<NewReview, 'beer' | 'container' | 'location'>> {
    const [beer, container, location] = await Promise.all([
      beerRepository.insertBeer(trx, buildNewBeer()),
      containerRepository.insertContainer(trx, buildNewContainer()),
      locationRepository.insertLocation(trx, buildNewLocation()),
    ])
    return { beer: beer.id, container: container.id, location: location.id }
  }

  test('insert a review', async () => {
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      const reviewRequest = buildNewReview(await insertReferred(trx))
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      assertDeepEqual(review, {
        ...reviewRequest,
        id: review.id,
      })
    })
  })

  test('find review by id', async () => {
    const review = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await reviewRepository.insertReview(
          trx,
          buildNewReview(await insertReferred(trx)),
        ),
    )
    const readReview = await reviewRepository.findReviewById(ctx.db, review.id)
    assertDeepEqual(readReview, review)
  })

  test('find review that does not exist', async () => {
    const readReview = await reviewRepository.findReviewById(
      ctx.db,
      'e1480b16-477c-49a7-b0ae-e1940b183966',
    )
    assertEqual(readReview, undefined)
  })

  test('insert and find a review without a location', async () => {
    const review = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await reviewRepository.insertReview(
          trx,
          buildNewReview({ ...(await insertReferred(trx)), location: '' }),
        ),
    )
    const readReview = await reviewRepository.findReviewById(ctx.db, review.id)
    assertEqual(readReview?.location, '')
  })

  test('update review', async () => {
    const review = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await reviewRepository.insertReview(
          trx,
          buildNewReview(await insertReferred(trx)),
        ),
    )
    const update: Review = {
      ...review,
      additionalInfo: 'Second bottle',
      location: '',
      rating: 9,
      smell: 'Cherries',
      taste: 'Sour cherries',
      time: new Date('2025-02-01T18:00:00.000Z'),
    }
    const updatedReview = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await reviewRepository.updateReview(trx, update),
    )
    assertDeepEqual(updatedReview, update)
    const readReview = await reviewRepository.findReviewById(ctx.db, review.id)
    assertDeepEqual(readReview, update)
  })

  test('update the given review only', async () => {
    const [updated, untouched] = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const referred = await insertReferred(trx)
        return await Promise.all([
          reviewRepository.insertReview(trx, buildNewReview(referred)),
          reviewRepository.insertReview(trx, buildNewReview(referred)),
        ])
      },
    )
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await reviewRepository.updateReview(trx, { ...updated, rating: 9 }),
    )
    const readReview = await reviewRepository.findReviewById(
      ctx.db,
      untouched.id,
    )
    assertDeepEqual(readReview, untouched)
  })

  test('update review that does not exist', async () => {
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await reviewRepository.updateReview(trx, {
          ...buildNewReview(),
          id: '2a8c5e1f-9b3d-4f7a-a6e2-4c0d8b1f5e93',
        }),
    )
    assertEqual(updated, undefined)
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
    // Both bounds are inclusive.
    {
      filter: {
        minTime: new Date('2023-02-01T18:00:00.000Z'),
        maxTime: new Date('2023-02-01T18:00:00.000Z'),
      },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.kriek1],
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
    test(title('list reviews', listCase), async () => {
      const { reviews } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviews(
        ctx.db,
        { size: 50, skip: 0 },
        { filter: { ...noFilter, ...listCase.filter }, order: listCase.order },
      )
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )

  test('list a page of reviews', async () => {
    const { reviews } = await insertScenario(ctx.db)
    const list = await reviewRepository.listReviews(
      ctx.db,
      { size: 2, skip: 2 },
      { filter: noFilter, order: { property: 'time', direction: 'asc' } },
    )
    assertDeepEqual(ids(list), ids([reviews.ipa1, reviews.faro]))
  })

  test('list a page of reviews by rating', async () => {
    const { reviews } = await insertScenario(ctx.db)
    const pages = await Promise.all(
      (['desc', 'asc'] as const).map(
        async (direction) =>
          await reviewRepository.listReviews(
            ctx.db,
            { size: 2, skip: 2 },
            { filter: noFilter, order: { property: 'rating', direction } },
          ),
      ),
    )
    assertDeepEqual(pages.map(ids), [
      ids([reviews.ipa3, reviews.faro]),
      ids([reviews.faro, reviews.ipa3]),
    ])
  })

  test('list a page of reviews of a collaboration', async () => {
    const collaboration = await insertCollaboration(ctx.db)
    const list = await reviewRepository.listReviews(
      ctx.db,
      { size: 1, skip: 1 },
      { filter: noFilter, order: { property: 'time', direction: 'asc' } },
    )
    assertDeepEqual(list, [
      joined(collaboration, collaboration.withoutLocation),
    ])
  })

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
    test(title('list reviews by IPA', listCase), async () => {
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
    {
      filter: {
        minTime: new Date('2024-01-15T18:00:00.000Z'),
        maxTime: new Date('2024-01-15T18:00:00.000Z'),
      },
      order: { property: 'time', direction: 'asc' },
      expected: (r) => [r.faro],
    },
  ]

  byBreweryCases.forEach((listCase) =>
    test(title('list reviews by Lindemans', listCase), async () => {
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
    {
      filter: {
        minTime: new Date('2023-06-01T18:00:00.000Z'),
        maxTime: new Date('2023-06-01T18:00:00.000Z'),
      },
      order: { property: 'time', direction: 'desc' },
      expected: (r) => [r.ipa1],
    },
  ]

  byLocationCases.forEach((listCase) =>
    test(title('list reviews by Kuja', listCase), async () => {
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
    test(title('list reviews by Lambic', listCase), async () => {
      const { reviews, lambic } = await insertScenario(ctx.db)
      const list = await reviewRepository.listReviewsByStyle(
        ctx.db,
        lambic.id,
        { filter: { ...noFilter, ...listCase.filter }, order: listCase.order },
      )
      assertDeepEqual(ids(list), ids(listCase.expected(reviews)))
    }),
  )

  const timeAsc: FullReviewListRequest = {
    filter: noFilter,
    order: { property: 'time', direction: 'asc' },
  }

  const collaborationLists: Array<{
    listing: string
    list: (collaboration: Collaboration) => Promise<JoinedReview[]>
    expected: (collaboration: Collaboration) => Review[]
  }> = [
    {
      listing: 'list reviews',
      list: async () =>
        await reviewRepository.listReviews(
          ctx.db,
          { size: 50, skip: 0 },
          timeAsc,
        ),
      expected: (c) => [c.atKuja, c.withoutLocation],
    },
    {
      listing: 'list reviews by beer',
      list: async (c) =>
        await reviewRepository.listReviewsByBeer(
          ctx.db,
          c.creamAle.id,
          timeAsc,
        ),
      expected: (c) => [c.atKuja, c.withoutLocation],
    },
    // Listed by one of its breweries, a review still has both.
    {
      listing: 'list reviews by brewery',
      list: async (c) =>
        await reviewRepository.listReviewsByBrewery(
          ctx.db,
          c.breweries[1].id,
          timeAsc,
        ),
      expected: (c) => [c.atKuja, c.withoutLocation],
    },
    {
      listing: 'list reviews by location',
      list: async (c) =>
        await reviewRepository.listReviewsByLocation(
          ctx.db,
          c.kuja.id,
          timeAsc,
        ),
      expected: (c) => [c.atKuja],
    },
    // Listed by one of its styles, a review still has both.
    {
      listing: 'list reviews by style',
      list: async (c) =>
        await reviewRepository.listReviewsByStyle(
          ctx.db,
          c.styles[1].id,
          timeAsc,
        ),
      expected: (c) => [c.atKuja, c.withoutLocation],
    },
  ]

  collaborationLists.forEach(({ listing, list, expected }) =>
    test(`${listing} of a collaboration with what each joins`, async () => {
      const collaboration = await insertCollaboration(ctx.db)
      const reviews = await list(collaboration)
      assertDeepEqual(
        reviews,
        expected(collaboration).map((review) => joined(collaboration, review)),
      )
    }),
  )
  interface Tasting {
    ipa: Beer
    nokian: Brewery
    kuja: Location
    ale: Style
    reviews: Review[]
  }

  // Three reviews of a Nokian Panimo IPA at Kuja, all with the same rating
  // and time, as when tasting several bottles side by side.
  async function insertTasting(): Promise<Tasting> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const [ipa, nokian, ale, container, kuja] = await Promise.all([
          beerRepository.insertBeer(trx, buildNewBeer({ name: 'IPA' })),
          breweryRepository.insertBrewery(
            trx,
            buildNewBrewery({ name: 'Nokian Panimo' }),
          ),
          styleRepository.insertStyle(trx, buildNewStyle({ name: 'Ale' })),
          containerRepository.insertContainer(trx, buildNewContainer()),
          locationRepository.insertLocation(
            trx,
            buildNewLocation({ name: 'Kuja' }),
          ),
        ])
        await Promise.all([
          beerRepository.insertBeerBreweries(trx, [
            { beer: ipa.id, brewery: nokian.id },
          ]),
          beerRepository.insertBeerStyles(trx, [
            { beer: ipa.id, style: ale.id },
          ]),
        ])
        const reviews = await Promise.all(
          [1, 2, 3].map(
            async () =>
              await reviewRepository.insertReview(
                trx,
                buildNewReview({
                  beer: ipa.id,
                  container: container.id,
                  location: kuja.id,
                  rating: 8,
                  time: new Date('2024-05-01T18:00:00.000Z'),
                }),
              ),
          ),
        )
        return { ipa, nokian, kuja, ale, reviews }
      },
    )
  }

  const tieOrders: ReviewListOrder[] = [
    { property: 'beer_name', direction: 'asc' },
    { property: 'beer_name', direction: 'desc' },
    { property: 'brewery_name', direction: 'asc' },
    { property: 'brewery_name', direction: 'desc' },
    { property: 'rating', direction: 'asc' },
    { property: 'rating', direction: 'desc' },
    { property: 'time', direction: 'asc' },
    { property: 'time', direction: 'desc' },
  ]

  const tieLists: Array<{
    listing: string
    list: (tasting: Tasting, order: ReviewListOrder) => Promise<JoinedReview[]>
  }> = [
    {
      listing: 'list reviews by beer',
      list: async (t, order) =>
        await reviewRepository.listReviewsByBeer(ctx.db, t.ipa.id, {
          filter: noFilter,
          order,
        }),
    },
    {
      listing: 'list reviews by brewery',
      list: async (t, order) =>
        await reviewRepository.listReviewsByBrewery(ctx.db, t.nokian.id, {
          filter: noFilter,
          order,
        }),
    },
    {
      listing: 'list reviews by location',
      list: async (t, order) =>
        await reviewRepository.listReviewsByLocation(ctx.db, t.kuja.id, {
          filter: noFilter,
          order,
        }),
    },
    {
      listing: 'list reviews by style',
      list: async (t, order) =>
        await reviewRepository.listReviewsByStyle(ctx.db, t.ale.id, {
          filter: noFilter,
          order,
        }),
    },
  ]

  tieLists.forEach(({ listing, list }) => {
    tieOrders.forEach((order: ReviewListOrder) => {
      const by = `${order.property} ${order.direction}`
      const name = `${listing} of the same time and rating by id, ${by}`
      test(name, async () => {
        const tasting = await insertTasting()
        const reviews = await list(tasting, order)
        assertDeepEqual(ids(reviews), ids(tasting.reviews).toSorted())
      })
    })
  })

  const fullTieOrders: FullReviewListOrder[] = [
    { property: 'rating', direction: 'asc' },
    { property: 'rating', direction: 'desc' },
    { property: 'time', direction: 'asc' },
    { property: 'time', direction: 'desc' },
  ]

  fullTieOrders.forEach((order: FullReviewListOrder) => {
    const by = `${order.property} ${order.direction}`
    test(`page reviews of the same time and rating by id, ${by}`, async () => {
      const tasting = await insertTasting()
      const pages = await Promise.all(
        [0, 1, 2].map(
          async (skip: number) =>
            await reviewRepository.listReviews(
              ctx.db,
              { size: 1, skip },
              { filter: noFilter, order },
            ),
        ),
      )
      assertDeepEqual(
        pages.map(ids),
        ids(tasting.reviews)
          .toSorted()
          .map((id: string) => [id]),
      )
    })
  })
})
