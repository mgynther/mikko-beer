import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context.js'
import type { Database } from '../../../src/data/database.js'
import * as reviewRepository from '../../../src/data/review/review.repository.js'
import type {
  JoinedReview,
  Review,
  ReviewListFilter,
  ReviewListOrder,
  ReviewListRequest,
} from '../../../src/core/review/review.js'
import { insertData, insertMultipleReviews } from '../review-helpers.js'
import {
  assertDeepEqual,
  assertEqual,
  assertNotDeepEqual,
} from '../../assert.js'

const noOpReviewListFilter: ReviewListFilter = {
  minRating: 4,
  maxRating: 10,
  minTime: new Date('1970-01-01'),
  maxTime: new Date('9999-01-01'),
}

describe('review tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function listReviews(
    db: Database,
    reviewListRequest: ReviewListRequest,
  ): Promise<JoinedReview[]> {
    return await reviewRepository.listReviews(
      db,
      { size: 50, skip: 0 },
      reviewListRequest,
    )
  }

  async function prepareListTest(
    db: Database,
    reviewListRequest: ReviewListRequest,
  ) {
    const { reviews, data } = await insertMultipleReviews(10, db)
    const list = await listReviews(db, reviewListRequest)
    return { reviews, data, list }
  }

  it('insert a review', async () => {
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      const { beer, container, location } = await insertData(trx)
      const reviewRequest = {
        beer: beer.id,
        additionalInfo: 'additional',
        container: container.id,
        location: location.id,
        rating: 8,
        time: new Date(),
        smell: 'vanilla',
        taste: 'chocolate',
      }
      const review = await reviewRepository.insertReview(trx, reviewRequest)
      assertDeepEqual(review, {
        ...reviewRequest,
        id: review.id,
      })
    })
  })

  function sortDates(dates: Date[]): Date[] {
    const sorted = [...dates]
    function sortDate(a: Date, b: Date) {
      return a.getTime() - b.getTime()
    }
    sorted.sort(sortDate)
    return sorted
  }

  it('list reviews, brewery_name desc', async () => {
    const db = ctx.db
    const { data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'brewery_name',
      direction: 'desc',
    }
    const list = await listReviews(db, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    assertEqual(list.length, 10)
    const start = new Array(5).fill(1).map((_) => data.brewery.name)
    const end = new Array(5).fill(1).map((_) => data.otherBrewery.name)
    const expectedNames = [...start, ...end]
    assertDeepEqual(
      list.map((item) => item.breweries[0].name),
      expectedNames,
    )
    function reviewToTime(row: JoinedReview): Date {
      return row.time
    }

    const breweryReviewTimes = list.slice(0, 5).map(reviewToTime)
    assertEqual(breweryReviewTimes.length, 5)
    const expectedBreweryReviewTimes = sortDates([...breweryReviewTimes])
    assertDeepEqual(breweryReviewTimes, expectedBreweryReviewTimes)

    const otherBreweryReviewTimes = list.slice(5, 10).map(reviewToTime)
    assertEqual(otherBreweryReviewTimes.length, 5)
    const expectedOtherBreweryReviewTimes = sortDates([
      ...otherBreweryReviewTimes,
    ])
    assertDeepEqual(otherBreweryReviewTimes, expectedOtherBreweryReviewTimes)
  })

  it('list reviews, beer_name asc', async () => {
    const db = ctx.db
    const { data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'asc',
    }
    const list = await listReviews(db, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    assertEqual(list.length, 10)
    const start = new Array(5).fill(1).map((_) => data.beer.name)
    const end = new Array(5).fill(1).map((_) => data.otherBeer.name)
    const expectedNames = [...start, ...end]
    assertDeepEqual(
      list.map((item) => item.beerName),
      expectedNames,
    )
    function reviewToTime(row: JoinedReview): Date {
      return row.time
    }

    const beerReviewTimes = list.slice(0, 5).map(reviewToTime)
    assertEqual(beerReviewTimes.length, 5)
    const expectedBeerReviewTimes = sortDates([...beerReviewTimes])
    assertDeepEqual(beerReviewTimes, expectedBeerReviewTimes)

    const otherBeerReviewTimes = list.slice(5, 10).map(reviewToTime)
    assertEqual(otherBeerReviewTimes.length, 5)
    const expectedOtherBeerReviewTimes = sortDates([...otherBeerReviewTimes])
    assertDeepEqual(otherBeerReviewTimes, expectedOtherBeerReviewTimes)
  })

  function toTime(review: Review | JoinedReview): Date {
    return review.time
  }

  function ascendingDates(a: Date, b: Date) {
    if (a < b) return -1
    if (b < a) return 1
    return 0
  }

  function descendingDates(a: Date, b: Date) {
    if (a > b) return -1
    if (b > a) return 1
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

  function ascendingRatings(a: RatingTime, b: RatingTime): number {
    if (a.rating === null && b.rating === null) return 0
    if (a.rating === null) return 1
    if (b.rating === null) return -1
    if (a.rating < b.rating) return -1
    if (b.rating < a.rating) return 1
    return descendingDates(a.time, b.time)
  }

  function descendingRatings(a: RatingTime, b: RatingTime): number {
    if (a.rating === null && b.rating === null) return 0
    if (a.rating === null) return 1
    if (b.rating === null) return -1
    if (a.rating > b.rating) return -1
    if (b.rating > a.rating) return 1
    return descendingDates(a.time, b.time)
  }

  async function testTime(
    db: Database,
    reviewListRequest: ReviewListRequest,
    sorter: TimeSorter,
    expectedReviewsFilter: (review: Review) => boolean,
  ) {
    const { reviews, list } = await prepareListTest(db, reviewListRequest)
    const listTimes = list.map(toTime)
    const filteredReviews = reviews.filter(expectedReviewsFilter)
    const expectedTimes = filteredReviews.map(toTime).sort(sorter)
    assertDeepEqual(listTimes, expectedTimes)

    const originalTimes = filteredReviews.map(toTime)
    assertNotDeepEqual(listTimes, originalTimes)
  }

  it('list reviews, time asc', async () => {
    await testTime(
      ctx.db,
      {
        filter: noOpReviewListFilter,
        order: { property: 'time', direction: 'asc' },
      },
      ascendingDates,
      () => true,
    )
  })

  it('list reviews filtered by min rating, time asc', async () => {
    await testTime(
      ctx.db,
      {
        filter: {
          ...noOpReviewListFilter,
          minRating: 6,
        },
        order: { property: 'time', direction: 'asc' },
      },
      ascendingDates,
      (review: Review) => review.rating >= 6,
    )
  })

  it('list reviews filtered by max rating, time asc', async () => {
    await testTime(
      ctx.db,
      {
        filter: {
          ...noOpReviewListFilter,
          maxRating: 7,
        },
        order: { property: 'time', direction: 'asc' },
      },
      ascendingDates,
      (review: Review) => review.rating <= 7,
    )
  })

  it('list reviews filtered by min time, time asc', async () => {
    const date = new Date('2023-12-31T23:59:59.000Z')
    await testTime(
      ctx.db,
      {
        filter: {
          ...noOpReviewListFilter,
          minTime: date,
        },
        order: { property: 'time', direction: 'asc' },
      },
      ascendingDates,
      (review: Review) => review.time >= date,
    )
  })

  it('list reviews filtered by max time, time asc', async () => {
    const date = new Date('2023-12-31T23:59:59.000Z')
    await testTime(
      ctx.db,
      {
        filter: {
          ...noOpReviewListFilter,
          maxTime: date,
        },
        order: { property: 'time', direction: 'asc' },
      },
      ascendingDates,
      (review: Review) => review.time <= date,
    )
  })

  it('list reviews, time desc', async () => {
    await testTime(
      ctx.db,
      {
        filter: noOpReviewListFilter,
        order: { property: 'time', direction: 'desc' },
      },
      descendingDates,
      () => true,
    )
  })

  async function testRatingTime(
    db: Database,
    reviewListRequest: ReviewListRequest,
    sorter: RatingSorter,
  ) {
    const { reviews, list } = await prepareListTest(db, reviewListRequest)
    const listRatingTimes = list.map(toRatingTime)
    const expectedRatingTimes = reviews.map(toRatingTime).sort(sorter)
    assertDeepEqual(listRatingTimes, expectedRatingTimes)

    const originalRatingTimes = reviews.map(toRatingTime)
    assertNotDeepEqual(listRatingTimes, originalRatingTimes)
  }

  it('list reviews, rating desc', async () => {
    await testRatingTime(
      ctx.db,
      {
        filter: noOpReviewListFilter,
        order: { property: 'rating', direction: 'desc' },
      },
      descendingRatings,
    )
  })

  it('list reviews, rating asc', async () => {
    await testRatingTime(
      ctx.db,
      {
        filter: noOpReviewListFilter,
        order: { property: 'rating', direction: 'asc' },
      },
      ascendingRatings,
    )
  })

  async function listReviewsByBeer(
    db: Database,
    beerId: string,
    reviewListRequest: ReviewListRequest,
  ) {
    return await reviewRepository.listReviewsByBeer(
      db,
      beerId,
      reviewListRequest,
    )
  }

  function testBeerIdFilteredList<T>(
    reviews: Review[],
    list: JoinedReview[],
    converter: (review: Review | JoinedReview) => T,
    sorter: (a: T, b: T) => number,
    beerId: string,
  ) {
    const listValues = list.map(converter)
    const expectedValues = reviews
      .filter((review) => review.beer === beerId)
      .map(converter)
      .sort(sorter)
    assertDeepEqual(listValues, expectedValues)

    const originalValues = reviews.map(converter)
    assertNotDeepEqual(listValues, originalValues)
  }

  it('list reviews by beer, beer_name desc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'desc',
    }
    const list = await listReviewsByBeer(db, data.otherBeer.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  interface ReviewFilterTest {
    name: string
    filter: ReviewListFilter
    reviewFilterFunction: (review: Review) => boolean
  }

  const beerFilterMinTestDate = new Date('2023-03-01T23:59:59.000Z')
  const beerFilterMaxTestDate = new Date('2023-04-01T23:59:59.000Z')
  const beerReviewFilterTests: ReviewFilterTest[] = [
    {
      name: 'min rating',
      filter: {
        ...noOpReviewListFilter,
        minRating: 6,
      },
      reviewFilterFunction: (review) => review.rating >= 6,
    },
    {
      name: 'max rating',
      filter: {
        ...noOpReviewListFilter,
        maxRating: 8,
      },
      reviewFilterFunction: (review) => review.rating <= 8,
    },
    {
      name: 'min time',
      filter: {
        ...noOpReviewListFilter,
        minTime: beerFilterMinTestDate,
      },
      reviewFilterFunction: (review) => review.time >= beerFilterMinTestDate,
    },
    {
      name: 'max time',
      filter: {
        ...noOpReviewListFilter,
        maxTime: beerFilterMaxTestDate,
      },
      reviewFilterFunction: (review) => review.time <= beerFilterMaxTestDate,
    },
  ]

  beerReviewFilterTests.forEach((testCase) =>
    it(`list reviews by beer and ${
      testCase.name
    }, beer_name desc`, async () => {
      const db = ctx.db
      const { reviews, data } = await insertMultipleReviews(10, db)
      const reviewListOrder: ReviewListOrder = {
        property: 'beer_name',
        direction: 'desc',
      }
      const list = await listReviewsByBeer(db, data.otherBeer.id, {
        filter: testCase.filter,
        order: reviewListOrder,
      })
      testBeerIdFilteredList(
        reviews.filter(testCase.reviewFilterFunction),
        list,
        toTime,
        ascendingDates,
        data.otherBeer.id,
      )
    }),
  )

  it('list reviews by beer, rating asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'rating',
      direction: 'asc',
    }
    const list = await listReviewsByBeer(db, data.beer.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toRatingTime,
      ascendingRatings,
      data.beer.id,
    )
  })

  it('list reviews by beer, time desc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'time',
      direction: 'desc',
    }
    const list = await listReviewsByBeer(db, data.otherBeer.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      descendingDates,
      data.otherBeer.id,
    )
  })

  async function listReviewsByBrewery(
    db: Database,
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) {
    return await reviewRepository.listReviewsByBrewery(
      db,
      breweryId,
      reviewListRequest,
    )
  }

  it('list reviews by brewery, beer_name asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'asc',
    }
    const list = await listReviewsByBrewery(db, data.otherBrewery.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  it('list reviews by brewery, rating desc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'rating',
      direction: 'desc',
    }
    const list = await listReviewsByBrewery(db, data.brewery.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toRatingTime,
      descendingRatings,
      data.beer.id,
    )
  })

  it('list reviews by brewery, time asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'time',
      direction: 'asc',
    }
    const list = await listReviewsByBrewery(db, data.otherBrewery.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  const breweryFilterMinTestDate = new Date('2023-03-01T23:59:59.000Z')
  const breweryFilterMaxTestDate = new Date('2023-05-01T23:59:59.000Z')
  const breweryReviewFilterTests: ReviewFilterTest[] = [
    {
      name: 'min rating',
      filter: {
        ...noOpReviewListFilter,
        minRating: 7,
      },
      reviewFilterFunction: (review) => review.rating >= 7,
    },
    {
      name: 'max rating',
      filter: {
        ...noOpReviewListFilter,
        maxRating: 7,
      },
      reviewFilterFunction: (review) => review.rating <= 7,
    },
    {
      name: 'min time',
      filter: {
        ...noOpReviewListFilter,
        minTime: breweryFilterMinTestDate,
      },
      reviewFilterFunction: (review) => review.time >= breweryFilterMinTestDate,
    },
    {
      name: 'max time',
      filter: {
        ...noOpReviewListFilter,
        maxTime: breweryFilterMaxTestDate,
      },
      reviewFilterFunction: (review) => review.time <= breweryFilterMaxTestDate,
    },
  ]

  breweryReviewFilterTests.forEach((testCase) =>
    it(`list reviews by brewery and ${testCase.name}, time asc`, async () => {
      const db = ctx.db
      const { reviews, data } = await insertMultipleReviews(10, db)
      const reviewListOrder: ReviewListOrder = {
        property: 'time',
        direction: 'asc',
      }
      const list = await listReviewsByBrewery(db, data.otherBrewery.id, {
        filter: testCase.filter,
        order: reviewListOrder,
      })
      testBeerIdFilteredList(
        reviews.filter(testCase.reviewFilterFunction),
        list,
        toTime,
        ascendingDates,
        data.otherBeer.id,
      )
    }),
  )

  async function listReviewsByLocation(
    db: Database,
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) {
    return await reviewRepository.listReviewsByLocation(
      db,
      locationId,
      reviewListRequest,
    )
  }

  it('list reviews by location, beer_name asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'asc',
    }
    const list = await listReviewsByLocation(db, data.otherLocation.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  it('list reviews by location, brewery_name asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'brewery_name',
      direction: 'asc',
    }
    const list = await listReviewsByLocation(db, data.otherLocation.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  it('list reviews by location, rating desc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'rating',
      direction: 'desc',
    }
    const list = await listReviewsByLocation(db, data.location.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toRatingTime,
      descendingRatings,
      data.beer.id,
    )
  })

  it('list reviews by location, time asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'time',
      direction: 'asc',
    }
    const list = await listReviewsByLocation(db, data.otherLocation.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  const locationFilterMinTestDate = new Date('2023-03-01T23:59:59.000Z')
  const locationFilterMaxTestDate = new Date('2023-05-01T23:59:59.000Z')
  const locationReviewFilterTests: ReviewFilterTest[] = [
    {
      name: 'min rating',
      filter: {
        ...noOpReviewListFilter,
        minRating: 7,
      },
      reviewFilterFunction: (review) => review.rating >= 7,
    },
    {
      name: 'max rating',
      filter: {
        ...noOpReviewListFilter,
        maxRating: 7,
      },
      reviewFilterFunction: (review) => review.rating <= 7,
    },
    {
      name: 'min time',
      filter: {
        ...noOpReviewListFilter,
        minTime: locationFilterMinTestDate,
      },
      reviewFilterFunction: (review) =>
        review.time >= locationFilterMinTestDate,
    },
    {
      name: 'max time',
      filter: {
        ...noOpReviewListFilter,
        maxTime: locationFilterMaxTestDate,
      },
      reviewFilterFunction: (review) =>
        review.time <= locationFilterMaxTestDate,
    },
  ]

  locationReviewFilterTests.forEach((testCase) =>
    it(`list reviews by location and ${testCase.name}, time desc`, async () => {
      const db = ctx.db
      const { reviews, data } = await insertMultipleReviews(10, db)
      const reviewListOrder: ReviewListOrder = {
        property: 'time',
        direction: 'desc',
      }
      const list = await listReviewsByLocation(db, data.otherLocation.id, {
        filter: testCase.filter,
        order: reviewListOrder,
      })
      testBeerIdFilteredList(
        reviews.filter(testCase.reviewFilterFunction),
        list,
        toTime,
        descendingDates,
        data.otherBeer.id,
      )
    }),
  )

  async function listReviewsByStyle(
    db: Database,
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) {
    return await reviewRepository.listReviewsByStyle(
      db,
      styleId,
      reviewListRequest,
    )
  }

  it('list reviews by style, beer_name asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'beer_name',
      direction: 'asc',
    }
    const list = await listReviewsByStyle(db, data.otherStyle.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })

  it('list reviews by style, rating desc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'rating',
      direction: 'desc',
    }
    const list = await listReviewsByStyle(db, data.style.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toRatingTime,
      descendingRatings,
      data.beer.id,
    )
  })

  const styleFilterMinTestDate = new Date('2023-03-01T23:59:59.000Z')
  const styleFilterMaxTestDate = new Date('2023-05-01T23:59:59.000Z')
  const styleReviewFilterTests: ReviewFilterTest[] = [
    {
      name: 'min rating',
      filter: {
        ...noOpReviewListFilter,
        minRating: 7,
      },
      reviewFilterFunction: (review) => review.rating >= 7,
    },
    {
      name: 'max rating',
      filter: {
        ...noOpReviewListFilter,
        maxRating: 7,
      },
      reviewFilterFunction: (review) => review.rating <= 7,
    },
    {
      name: 'min time',
      filter: {
        ...noOpReviewListFilter,
        minTime: styleFilterMinTestDate,
      },
      reviewFilterFunction: (review) => review.time >= styleFilterMinTestDate,
    },
    {
      name: 'max time',
      filter: {
        ...noOpReviewListFilter,
        maxTime: styleFilterMaxTestDate,
      },
      reviewFilterFunction: (review) => review.time <= styleFilterMaxTestDate,
    },
  ]

  styleReviewFilterTests.forEach((testCase) =>
    it(`list reviews by style and ${testCase.name}, rating asc`, async () => {
      const db = ctx.db
      const { reviews, data } = await insertMultipleReviews(10, db)
      const reviewListOrder: ReviewListOrder = {
        property: 'rating',
        direction: 'asc',
      }
      const list = await listReviewsByStyle(db, data.style.id, {
        filter: testCase.filter,
        order: reviewListOrder,
      })
      testBeerIdFilteredList(
        reviews.filter(testCase.reviewFilterFunction),
        list,
        toRatingTime,
        ascendingRatings,
        data.beer.id,
      )
    }),
  )

  it('list reviews by style, time asc', async () => {
    const db = ctx.db
    const { reviews, data } = await insertMultipleReviews(10, db)
    const reviewListOrder: ReviewListOrder = {
      property: 'time',
      direction: 'asc',
    }
    const list = await listReviewsByStyle(db, data.otherStyle.id, {
      filter: noOpReviewListFilter,
      order: reviewListOrder,
    })
    testBeerIdFilteredList(
      reviews,
      list,
      toTime,
      ascendingDates,
      data.otherBeer.id,
    )
  })
})
