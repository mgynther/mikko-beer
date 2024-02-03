import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type Database, type Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'
import * as containerRepository from '../../../src/data/container/container.repository'
import * as reviewRepository from '../../../src/data/review/review.repository'
import * as styleRepository from '../../../src/data/style/style.repository'
import { type ReviewListOrder } from '../../../src/core/review/review'
import { DbJoinedReview, ReviewRow } from '../../../src/data/review/review.table'

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function insertData(trx: Transaction) {
      const brewery =
        await breweryRepository.insertBrewery(trx, { name: 'Salama' })
      const style = await styleRepository.insertStyle(trx, { name: 'Helles' })
      const beer = await beerRepository.insertBeer(trx, { name: 'Brainzilla' })
      const beerBreweryRequest = {
        beer: beer.beer_id,
        brewery: brewery.brewery_id
      }
      await beerRepository.insertBeerBrewery(trx, beerBreweryRequest)
      const beerStyleRequest = {
        beer: beer.beer_id,
        style: style.style_id
      }
      await beerRepository.insertBeerStyle(trx, beerStyleRequest)
      const containerRequest = {
        size: '0.50',
        type: 'bottle'
      }
      const container =
        await containerRepository.insertContainer(trx, containerRequest)
      return { beer, container }
  }

  async function insertMultipleReviews(
    count: number,
    db: Database
  ): Promise<ReviewRow[]> {
    const reviews: ReviewRow[]  = []
    await db.executeTransaction(async (trx: Transaction) => {
      const { beer, container } = await insertData(trx)
      for (let i = 0; i < count; i++) {
        const reviewRequest = {
          beer: beer.beer_id,
          container: container.container_id,
          rating: (i % 7) + 4,
          time: new Date(`2024-0${(i % 3) + 2}-0${(i % 5) + 1}T18:00:00.000Z`),
          smell: "vanilla",
          taste: "chocolate"
        }
        reviews.push(await reviewRepository.insertReview(trx, reviewRequest))
      }
    })
    return reviews
  }

  async function listReviews(db: Database, reviewListOrder: ReviewListOrder) {
    return await reviewRepository.listReviews(
      db,
      { size: 50, skip: 0 },
      reviewListOrder
    )
  }

  async function prepareListTest(
    db: Database,
    reviewListOrder: ReviewListOrder
  ) {
    const reviews = await insertMultipleReviews(10, db)
    const list = await listReviews(db, reviewListOrder)
    expect(reviews.length).equal(list.length)
    return { reviews, list }
  }

  it('insert a review', async () => {
    await ctx.db.executeTransaction(async (trx) => {
      const { beer, container } = await insertData(trx)
      const reviewRequest = {
        beer: beer.beer_id,
        additional_info: "additional",
        container: container.container_id,
        location: "location",
        rating: 8,
        time: new Date(),
        smell: "vanilla",
        taste: "chocolate"
      }
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      expect(review).eql({
        ...reviewRequest,
        created_at: review.created_at,
        review_id: review.review_id
      })
    })
  })

  function ascendingDates (a: Date, b: Date) {
    if (a < b) return -1;
    if (b < a) return 1;
    return 0
  }

  function descendingDates (a: Date, b: Date) {
    if (a > b) return -1;
    if (b > a) return 1;
    return 0
  }

  interface RatingTime {
    rating: number | null
    time: Date
  }

  function toRatingTime(review: DbJoinedReview | ReviewRow): RatingTime {
    return { rating: review.rating, time: review.time }
  }

  type TimeSorter = (a: Date, b: Date) => number
  type RatingSorter = (a: RatingTime, b: RatingTime) => number

  function ascendingRatings (a: RatingTime, b: RatingTime): number {
    if (a.rating === null && b.rating === null) return 0;
    if (a.rating === null) return 1;
    if (b.rating === null) return -1;
    if (a.rating < b.rating) return -1;
    if (b.rating < a.rating) return 1;
    return descendingDates(a.time, b.time)
  }

  function descendingRatings (a: RatingTime, b: RatingTime): number {
    if (a.rating === null && b.rating === null) return 0;
    if (a.rating === null) return 1;
    if (b.rating === null) return -1;
    if (a.rating > b.rating) return -1;
    if (b.rating > a.rating) return 1;
    return descendingDates(a.time, b.time)
  }

  async function testTime(
    db: Database,
    reviewListOrder: ReviewListOrder,
    sorter: TimeSorter
  ) {
    const { reviews, list } = await prepareListTest(db, reviewListOrder)
    const listTimes = list.map(review => review.time)
    const expectedTimes = reviews.map(review => review.time)
      .sort(sorter)
    expect(listTimes).eql(expectedTimes)

    const originalTimes = reviews.map(review => review.time)
    expect(listTimes).not.eql(originalTimes)
  }

  it('list reviews, time asc', async() => {
    await testTime(
      ctx.db,
      { property: 'time', direction: 'asc' },
      ascendingDates
    )
  })

  it('list reviews, time desc', async() => {
    await testTime(
      ctx.db,
      { property: 'time', direction: 'desc' },
      descendingDates
    )
  })

  async function testRatingTime(
    db: Database,
    reviewListOrder: ReviewListOrder,
    sorter: RatingSorter
  ) {
    const { reviews, list } = await prepareListTest(db, reviewListOrder)
    const listRatingTimes = list.map(toRatingTime)
    const expectedRatingTimes = reviews.map(toRatingTime)
      .sort(sorter)
    expect(listRatingTimes).eql(expectedRatingTimes)

    const originalRatingTimes = reviews.map(toRatingTime)
    expect(listRatingTimes).not.eql(originalRatingTimes)
  }

  it('list reviews, rating desc', async() => {
    await testRatingTime(
      ctx.db,
      { property: 'rating', direction: 'desc' },
      descendingRatings
    )
  })

  it('list reviews, rating asc', async() => {
    await testRatingTime(
      ctx.db,
      { property: 'rating', direction: 'asc' },
      ascendingRatings
    )
  })
})
