import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type Database, type Transaction } from '../../../src/data/database'
import * as beerRepository from '../../../src/data/beer/beer.repository'
import { type BeerRow } from '../../../src/data/beer/beer.table'
import * as breweryRepository from '../../../src/data/brewery/brewery.repository'
import { type BreweryRow } from '../../../src/data/brewery/brewery.table'
import * as containerRepository from '../../../src/data/container/container.repository'
import { type ContainerRow } from '../../../src/data/container/container.table'
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

  interface InsertedData {
    beer: BeerRow
    otherBeer: BeerRow
    brewery: BreweryRow
    otherBrewery: BreweryRow
    container: ContainerRow
  }

  async function insertData(trx: Transaction): Promise<InsertedData> {
      const brewery =
        await breweryRepository.insertBrewery(trx, { name: 'Salama' })
      const otherBrewery =
        await breweryRepository.insertBrewery(trx, { name: 'Brewdog' })
      const style = await styleRepository.insertStyle(trx, { name: 'Lager' })
      const beer = await beerRepository.insertBeer(trx, { name: 'Brainzilla' })
      const otherBeer =
        await beerRepository.insertBeer(trx, { name: 'Lost Planet' })
      const beerBreweryRequest = {
        beer: beer.beer_id,
        brewery: brewery.brewery_id
      }
      await beerRepository.insertBeerBrewery(trx, beerBreweryRequest)
      const otherBeerBreweryRequest = {
        beer: otherBeer.beer_id,
        brewery: otherBrewery.brewery_id
      }
      await beerRepository.insertBeerBrewery(trx, otherBeerBreweryRequest)
      const beerStyleRequest = {
        beer: beer.beer_id,
        style: style.style_id
      }
      await beerRepository.insertBeerStyle(trx, beerStyleRequest)
      const otherBeerStyleRequest = {
        beer: otherBeer.beer_id,
        style: style.style_id
      }
      await beerRepository.insertBeerStyle(trx, otherBeerStyleRequest)
      const containerRequest = {
        size: '0.50',
        type: 'bottle'
      }
      const container =
        await containerRepository.insertContainer(trx, containerRequest)
      return { beer, otherBeer, brewery, otherBrewery, container }
  }

  async function insertMultipleReviews(
    count: number,
    db: Database
  ): Promise<{ reviews: ReviewRow[], data: InsertedData }> {
    const reviews: ReviewRow[] = []
    let data: InsertedData | undefined = undefined
    await db.executeTransaction(async (trx: Transaction) => {
      data = await insertData(trx)
      const { beer, otherBeer, container } = data
      for (let i = 0; i < count; i++) {
        const reviewRequest = {
          beer: (i % 2 === 0) ? beer.beer_id : otherBeer.beer_id,
          container: container.container_id,
          rating: (i % 7) + 4,
          time: new Date(`2024-0${(i % 3) + 2}-0${(i % 5) + 1}T18:00:00.000Z`),
          smell: "vanilla",
          taste: "chocolate"
        }
        reviews.push(await reviewRepository.insertReview(trx, reviewRequest))
      }
    })
    if (data === undefined) throw new Error('data must not be undefined')
    return { reviews, data }
  }

  async function listReviews(
    db: Database,
    reviewListOrder: ReviewListOrder
  ): Promise<DbJoinedReview[]> {
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
    expect(reviews.length).equal(list.length)
    return { reviews, data, list }
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

  function toTime(review: DbJoinedReview | ReviewRow): Date {
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
    const listTimes = list.map(toTime)
    const expectedTimes = reviews.map(toTime)
      .sort(sorter)
    expect(listTimes).eql(expectedTimes)

    const originalTimes = reviews.map(toTime)
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

  async function listReviewsByBeer(db: Database, beerId: string, reviewListOrder: ReviewListOrder) {
    return await reviewRepository.listReviewsByBeer(
      db,
      beerId,
      reviewListOrder
    )
  }

  function testFilteredList<T>(
    reviews: ReviewRow[],
    list: DbJoinedReview[],
    converter: (review: DbJoinedReview | ReviewRow) => T,
    sorter: (a: T, b: T) => number,
    beerId: string
  ) {
    expect(reviews.length / 2).equal(list.length)
    const listValues = list.map(converter)
    const expectedValues = reviews
      .filter(review => review.beer === beerId)
      .map(converter)
      .sort(sorter)
    expect(listValues).eql(expectedValues)

    const originalValues = reviews.map(converter)
    expect(listValues).not.eql(originalValues)
  }

  it('list reviews by beer, beer_name desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'beer_name', direction: 'desc' }
    const list = await listReviewsByBeer(db, data.otherBeer.beer_id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.beer_id)
  })

  it('list reviews by beer, rating asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'rating', direction: 'asc' }
    const list = await listReviewsByBeer(db, data.beer.beer_id, reviewListOrder)
    testFilteredList(reviews, list, toRatingTime, ascendingRatings, data.beer.beer_id)
  })

  it('list reviews by beer, time desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'time', direction: 'desc' }
    const list = await listReviewsByBeer(db, data.otherBeer.beer_id, reviewListOrder)
    testFilteredList(reviews, list, toTime, descendingDates, data.otherBeer.beer_id)
  })

  async function listReviewsByBrewery(db: Database, breweryId: string, reviewListOrder: ReviewListOrder) {
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
    const list = await listReviewsByBrewery(db, data.otherBrewery.brewery_id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.beer_id)
  })

  it('list reviews by brewery, rating desc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'rating', direction: 'desc' }
    const list = await listReviewsByBrewery(db, data.brewery.brewery_id, reviewListOrder)
    testFilteredList(reviews, list, toRatingTime, descendingRatings, data.beer.beer_id)
  })

  it('list reviews by brewery, time asc', async() => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder =
      { property: 'time', direction: 'asc' }
    const list = await listReviewsByBrewery(db, data.otherBrewery.brewery_id, reviewListOrder)
    testFilteredList(reviews, list, toTime, ascendingDates, data.otherBeer.beer_id)
  })
})
