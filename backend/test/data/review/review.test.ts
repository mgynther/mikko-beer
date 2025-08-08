import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { TestContext } from '../test-context'
import type { Database } from '../../../src/data/database'
import * as reviewRepository from '../../../src/data/review/review.repository'
import type {
  JoinedReview,
  Review,
  ReviewListOrder
} from '../../../src/core/review/review'
import { insertData, insertMultipleReviews } from '../review-helpers'

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function listReviews(
    db: Database,
    reviewListOrder: ReviewListOrder
  ): Promise<JoinedReview[]> {
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
    const { reviews, data } = await insertMultipleReviews(10, db)
    const list = await listReviews(db, reviewListOrder)
    assert.equal(reviews.length, list.length)
    return { reviews, data, list }
  }

  it('insert a review', async () => {
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      const { beer, container, location } = await insertData(trx)
      const reviewRequest = {
        beer: beer.id,
        additionalInfo: "additional",
        container: container.id,
        location: location.id,
        rating: 8,
        time: new Date(),
        smell: "vanilla",
        taste: "chocolate"
      }
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      assert.deepEqual(review, {
        ...reviewRequest,
        id: review.id,
      })
    })
  })

  it('list reviews, brewery_name desc', async() => {
    const db = ctx.db
    const { data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'brewery_name', direction: 'desc' }
    const list = await listReviews(db, reviewListOrder)
    assert.equal(list.length, 10);
    const start = new Array(5).fill(1).map(_ => data.brewery.name)
    const end = new Array(5).fill(1).map(_ => data.otherBrewery.name)
    const expectedNames = [...start, ...end]
    assert.deepEqual(list.map(item => item.breweries[0].name), expectedNames)
    function reviewToTime(row: JoinedReview): Date {
      return row.time
    }

    const breweryReviewTimes = list.slice(0, 5).map(reviewToTime)
    assert.equal(breweryReviewTimes.length, 5)
    const expectedBreweryReviewTimes = [...breweryReviewTimes]
    function sortDate(a: Date, b: Date) {
      return a.getTime() - b.getTime()
    }
    expectedBreweryReviewTimes.sort(sortDate)
    assert.deepEqual(breweryReviewTimes, expectedBreweryReviewTimes)

    const otherBreweryReviewTimes = list.slice(5, 10).map(reviewToTime)
    assert.equal(otherBreweryReviewTimes.length, 5)
    const expectedOtherBreweryReviewTimes = [...otherBreweryReviewTimes]
    expectedOtherBreweryReviewTimes.sort(sortDate)
    assert.deepEqual(otherBreweryReviewTimes, expectedOtherBreweryReviewTimes)
  })

  function toTime(review: Review | JoinedReview): Date {
    return review.time
  }

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

  function toRatingTime(review: Review | JoinedReview): RatingTime {
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
    const listTimes = list.map(toTime)
    const expectedTimes = reviews.map(toTime)
      .sort(sorter)
    assert.deepEqual(listTimes, expectedTimes)

    const originalTimes = reviews.map(toTime)
    assert.notDeepEqual(listTimes, originalTimes)
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
    assert.deepEqual(listRatingTimes, expectedRatingTimes)

    const originalRatingTimes = reviews.map(toRatingTime)
    assert.notDeepEqual(listRatingTimes, originalRatingTimes)
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

  async function listReviewsByBeer(
    db: Database,
    beerId: string,
    reviewListOrder: ReviewListOrder
  ) {
    return await reviewRepository.listReviewsByBeer(
      db,
      beerId,
      reviewListOrder
    )
  }

  function testFilteredList<T>(
    reviews: Review[],
    list: JoinedReview[],
    converter: (review: Review | JoinedReview) => T,
    sorter: (a: T, b: T) => number,
    beerId: string
  ) {
    assert.equal(reviews.length / 2, list.length)
    const listValues = list.map(converter)
    const expectedValues = reviews
      .filter(review => review.beer === beerId)
      .map(converter)
      .sort(sorter)
    assert.deepEqual(listValues, expectedValues)

    const originalValues = reviews.map(converter)
    assert.notDeepEqual(listValues, originalValues)
  }

  it('list reviews by beer, beer_name desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'beer_name', direction: 'desc' }
    const list = await listReviewsByBeer(db, data.otherBeer.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

  it('list reviews by beer, rating asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'rating', direction: 'asc' }
    const list = await listReviewsByBeer(db, data.beer.id, reviewListOrder)
    testFilteredList(reviews, list, toRatingTime, ascendingRatings, data.beer.id)
  })

  it('list reviews by beer, time desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'time', direction: 'desc' }
    const list = await listReviewsByBeer(db, data.otherBeer.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, descendingDates, data.otherBeer.id)
  })

  async function listReviewsByBrewery(
    db: Database,
    breweryId: string,
    reviewListOrder: ReviewListOrder
  ) {
    return await reviewRepository.listReviewsByBrewery(
      db,
      breweryId,
      reviewListOrder
    )
  }

  it('list reviews by brewery, beer_name asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'beer_name', direction: 'asc' }
    const list = await listReviewsByBrewery(db, data.otherBrewery.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

  it('list reviews by brewery, rating desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'rating', direction: 'desc' }
    const list = await listReviewsByBrewery(db, data.brewery.id, reviewListOrder)
    testFilteredList(reviews, list, toRatingTime, descendingRatings, data.beer.id)
  })

  it('list reviews by brewery, time asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'time', direction: 'asc' }
    const list = await listReviewsByBrewery(db, data.otherBrewery.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

  async function listReviewsByLocation(
    db: Database,
    locationId: string,
    reviewListOrder: ReviewListOrder
  ) {
    return await reviewRepository.listReviewsByLocation(
      db,
      locationId,
      reviewListOrder
    )
  }

  it('list reviews by location, beer_name asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'beer_name', direction: 'asc' }
    const list =
      await listReviewsByLocation(db, data.otherLocation.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

  it('list reviews by location, rating desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'rating', direction: 'desc' }
    const list =
      await listReviewsByLocation(db, data.location.id, reviewListOrder)
    testFilteredList(
      reviews,
      list,
      toRatingTime,
      descendingRatings,
      data.beer.id
    )
  })

  it('list reviews by location, time asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'time', direction: 'asc' }
    const list =
      await listReviewsByLocation(db, data.otherLocation.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

  async function listReviewsByStyle(
    db: Database,
    styleId: string,
    reviewListOrder: ReviewListOrder
  ) {
    return await reviewRepository.listReviewsByStyle(
      db,
      styleId,
      reviewListOrder
    )
  }

  it('list reviews by style, beer_name asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'beer_name', direction: 'asc' }
    const list = await listReviewsByStyle(db, data.otherStyle.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

  it('list reviews by style, rating desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'rating', direction: 'desc' }
    const list = await listReviewsByStyle(db, data.style.id, reviewListOrder)
    testFilteredList(reviews, list, toRatingTime, descendingRatings, data.beer.id)
  })

  it('list reviews by style, time asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'time', direction: 'asc' }
    const list = await listReviewsByStyle(db, data.otherStyle.id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.id)
  })

})
