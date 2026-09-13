import { describe, it } from 'node:test'

import {
  validateCreateReviewRequest,
  validateFilteredReviewListOrder,
  validateFullReviewListOrder,
  validateReviewId,
  validateReviewListFilter,
  validateUpdateReviewRequest,
} from '../../src/validation/review.js'
import type { ReviewRequest } from '../../src/validation/review.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

function validRequest(): ReviewRequest {
  return {
    additionalInfo: 'Brewed with coffee',
    beer: 'b6a7b38d-3ee3-4a0c-8f6a-97424c6c65e5',
    container: '3e4067dd-3642-475a-91d5-01f8759bc124',
    location: 'A bizarre bar',
    rating: 8,
    time: '2023-12-07T22:32:40.123+02:00',
    smell: 'piny',
    taste: 'nutty notes',
  }
}

describe('review validation unit tests', () => {
  const id = '49f208f7-07b2-4fca-bbd3-8a4bc49b9b38'

  ;[
    {
      func: validateCreateReviewRequest,
      title: (base: string) => `${base}: create`,
      outputFormatter: (input: object) => input,
    },
    {
      func: (request: unknown) => validateUpdateReviewRequest(request, id),
      title: (base: string) => `${base}: update`,
      outputFormatter: (input: object) => ({
        id,
        request: input,
      }),
    },
  ].forEach((validator) => {
    const { func, title, outputFormatter } = validator

    function pass(review: ReviewRequest) {
      const input = { ...review }
      const output = { ...review }
      const validationResult = func(input)
      assertEqual(validationResult.errorCode, undefined)
      assertDeepEqual(validationResult.result, outputFormatter(output))
    }

    it(title('pass validation'), () => {
      pass(validRequest())
    })

    it(title('pass with empty additional info'), () => {
      const review = {
        ...validRequest(),
        additionalInfo: '',
      }
      pass(review)
    })

    it(title('pass with empty location'), () => {
      const review = {
        ...validRequest(),
        location: '',
      }
      pass(review)
    })

    it(title('pass with UTC time'), () => {
      const review = {
        ...validRequest(),
        time: '2023-12-07T20:32:40.123Z',
      }
      pass(review)
    })

    it(title('pass with - timezone'), () => {
      const review = {
        ...validRequest(),
        time: '2023-12-07T19:32:40.123-01:00',
      }
      pass(review)
    })

    function numberRange(start: number, end: number) {
      return Array(end - start + 1)
        .fill(start)
        .map((x, y) => x + y)
    }
    numberRange(4, 10).forEach((rating) =>
      it(title(`pass with rating ${rating}`), () => {
        const review = {
          ...validRequest(),
          rating,
        }
        pass(review)
      }),
    )

    function fail(review: unknown) {
      const validationResult = func(review)
      assertEqual(validationResult.errorCode, 'invalid-review')
      assertEqual(validationResult.result, undefined)
    }

    it(title('fail with empty beer'), () => {
      const review = {
        ...validRequest(),
        beer: '',
      }
      fail(review)
    })

    it(title('fail without additionalInfo'), () => {
      const { beer, container, location, rating, time, smell, taste } =
        validRequest()
      fail({ beer, container, location, rating, time, smell, taste })
    })

    it(title('fail without beer'), () => {
      const {
        additionalInfo,
        container,
        location,
        rating,
        time,
        smell,
        taste,
      } = validRequest()
      fail({ additionalInfo, container, location, rating, time, smell, taste })
    })

    it(title('fail with empty container'), () => {
      const review = {
        ...validRequest(),
        container: '',
      }
      fail(review)
    })

    it(title('fail without container'), () => {
      const { additionalInfo, beer, location, rating, time, smell, taste } =
        validRequest()
      fail({ additionalInfo, beer, location, rating, time, smell, taste })
    })

    it(title('fail without location'), () => {
      const { additionalInfo, beer, container, rating, time, smell, taste } =
        validRequest()
      fail({ additionalInfo, beer, container, rating, time, smell, taste })
    })

    it(title('fail with invalid rating'), () => {
      const review = {
        ...validRequest(),
        rating: '',
      }
      fail(review)
    })

    it(title('fail without rating'), () => {
      const { additionalInfo, beer, container, location, time, smell, taste } =
        validRequest()
      fail({ additionalInfo, beer, container, location, time, smell, taste })
    })

    it(title('fail with rating below range'), () => {
      const review = {
        ...validRequest(),
        rating: 3,
      }
      fail(review)
    })

    it(title('fail with rating above range'), () => {
      const review = {
        ...validRequest(),
        rating: 11,
      }
      fail(review)
    })

    it(title('fail with non-integer rating'), () => {
      const review = {
        ...validRequest(),
        rating: 9.12,
      }
      fail(review)
    })

    it(title('fail with empty smell'), () => {
      const review = {
        ...validRequest(),
        smell: '',
      }
      fail(review)
    })

    it(title('fail without smell'), () => {
      const { additionalInfo, beer, container, location, rating, time, taste } =
        validRequest()
      fail({ additionalInfo, beer, container, location, rating, time, taste })
    })

    it(title('fail with empty taste'), () => {
      const review = {
        ...validRequest(),
        taste: '',
      }
      fail(review)
    })

    it(title('fail without taste'), () => {
      const { additionalInfo, beer, container, location, rating, time, smell } =
        validRequest()
      fail({ additionalInfo, beer, container, location, rating, time, smell })
    })

    it(title('fail with malformed time'), () => {
      const review = {
        ...validRequest(),
        time: '2023-12-07',
      }
      fail(review)
    })

    it(title('fail with invalid time'), () => {
      const review = {
        ...validRequest(),
        time: 123,
      }
      fail(review)
    })

    it(title('fail without time'), () => {
      const {
        additionalInfo,
        beer,
        container,
        location,
        rating,
        smell,
        taste,
      } = validRequest()
      fail({ additionalInfo, beer, container, location, rating, smell, taste })
    })

    it(title('fail with additional property'), () => {
      const review = {
        ...validRequest(),
        additional: 'will fail',
      }
      fail(review)
    })
  })

  interface InvalidIdCase {
    label: string
    id: string | undefined
  }
  const invalidIdCases: InvalidIdCase[] = [
    { label: 'empty string', id: '' },
    { label: 'undefined', id: undefined },
  ]

  invalidIdCases.forEach((testCase) =>
    it(`fail update with ${testCase.label} review id`, () => {
      const validationResult = validateUpdateReviewRequest(
        validRequest(),
        testCase.id,
      )
      assertEqual(validationResult.errorCode, 'invalid-review-id')
      assertEqual(validationResult.result, undefined)
    }),
  )

  it('valid review id passes validation', () => {
    const validationResult = validateReviewId(id)
    assertEqual(validationResult.errorCode, undefined)
    assertEqual(validationResult.result, id)
  })

  invalidIdCases.forEach((testCase) =>
    it(`invalid review id "${testCase.label}" fails validation`, () => {
      const validationResult = validateReviewId(testCase.id)
      assertEqual(validationResult.errorCode, 'invalid-review-id')
      assertEqual(validationResult.result, undefined)
    }),
  )
})

function validOrderQuery(): Record<string, unknown> {
  return { order: 'time', direction: 'desc' }
}

interface CommonOrderCase {
  title: string
  func: (query: Record<string, unknown>) => {
    errorCode: string | undefined
    result: { property: string; direction: string } | undefined
  }
}

describe('review list order validation unit tests', () => {
  ;[
    {
      title: 'full review list order',
      func: validateFullReviewListOrder,
    },
    {
      title: 'filtered review list order',
      func: validateFilteredReviewListOrder,
    },
  ].forEach((testCase: CommonOrderCase) => {
    const { func, title } = testCase

    function pass(query: Record<string, unknown>, expected: object) {
      const validationResult = func(query)
      assertEqual(validationResult.errorCode, undefined)
      assertDeepEqual(validationResult.result, expected)
    }

    function failOrder(query: Record<string, unknown>) {
      const validationResult = func(query)
      assertEqual(validationResult.errorCode, 'invalid-review-list-query-order')
      assertEqual(validationResult.result, undefined)
    }

    it(`valid test helper is valid, ${title}`, () => {
      pass(validOrderQuery(), { property: 'time', direction: 'desc' })
    })

    it(`invalid order value, ${title}`, () => {
      failOrder({ ...validOrderQuery(), order: 'testing' })
    })

    it(`invalid order type, ${title}`, () => {
      failOrder({ ...validOrderQuery(), order: 123 })
    })

    it(`invalid direction value, ${title}`, () => {
      failOrder({ ...validOrderQuery(), direction: 'testing' })
    })

    it(`invalid direction type, ${title}`, () => {
      failOrder({ ...validOrderQuery(), direction: [] })
    })

    it(`time desc, ${title}`, () => {
      pass(
        { order: 'time', direction: 'desc' },
        {
          property: 'time',
          direction: 'desc',
        },
      )
    })

    it(`time asc, ${title}`, () => {
      pass(
        { order: 'time', direction: 'asc' },
        {
          property: 'time',
          direction: 'asc',
        },
      )
    })

    it(`rating asc, ${title}`, () => {
      pass(
        { order: 'rating', direction: 'asc' },
        {
          property: 'rating',
          direction: 'asc',
        },
      )
    })

    it(`rating desc, ${title}`, () => {
      pass(
        { order: 'rating', direction: 'desc' },
        {
          property: 'rating',
          direction: 'desc',
        },
      )
    })
  })

  it('defaults with undefined, full review list order', () => {
    const validationResult = validateFullReviewListOrder({})
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'time',
      direction: 'desc',
    })
  })

  it('defaults with undefined, filtered review list order', () => {
    const validationResult = validateFilteredReviewListOrder({})
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'beer_name',
      direction: 'asc',
    })
  })

  it('defaults with empty string, full review list order', () => {
    const validationResult = validateFullReviewListOrder({
      order: '',
      direction: '',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'time',
      direction: 'desc',
    })
  })

  it('defaults with empty string, filtered review list order', () => {
    const validationResult = validateFilteredReviewListOrder({
      order: '',
      direction: '',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'beer_name',
      direction: 'asc',
    })
  })

  it('beer_name fails, full review list order', () => {
    const validationResult = validateFullReviewListOrder({
      order: 'beer_name',
      direction: 'desc',
    })
    assertEqual(
      validationResult.errorCode,
      'invalid-review-list-query-beer-name',
    )
    assertEqual(validationResult.result, undefined)
  })

  it('beer_name desc, filtered review list order', () => {
    const validationResult = validateFilteredReviewListOrder({
      order: 'beer_name',
      direction: 'desc',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'beer_name',
      direction: 'desc',
    })
  })

  it('brewery_name fails, full review list order', () => {
    const validationResult = validateFullReviewListOrder({
      order: 'brewery_name',
      direction: 'desc',
    })
    assertEqual(
      validationResult.errorCode,
      'invalid-review-list-query-brewery-name',
    )
    assertEqual(validationResult.result, undefined)
  })

  it('brewery_name asc, filtered review list order', () => {
    const validationResult = validateFilteredReviewListOrder({
      order: 'brewery_name',
      direction: 'asc',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'brewery_name',
      direction: 'asc',
    })
  })
})

interface ReviewListFilterQuery {
  min_rating: string
  max_rating: string
  min_time: string
  max_time: string
}

describe('review list filter validation unit tests', () => {
  it('defaults to the full range when all properties are missing', () => {
    const validationResult = validateReviewListFilter({})
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      minRating: 4,
      maxRating: 10,
      minTime: new Date('1970-01-01T00:00:00.000Z'),
      maxTime: new Date('2100-01-01T00:00:00.000Z'),
    })
  })

  it('defaults to the full range when all properties are empty', () => {
    const validationResult = validateReviewListFilter({
      min_rating: '',
      max_rating: '',
      min_time: '',
      max_time: '',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      minRating: 4,
      maxRating: 10,
      minTime: new Date('1970-01-01T00:00:00.000Z'),
      maxTime: new Date('2100-01-01T00:00:00.000Z'),
    })
  })

  it('returns values matching the input when all properties are valid', () => {
    const minTime = 1678334400000
    const maxTime = 1746792000000
    const validQuery: ReviewListFilterQuery = {
      min_rating: '5',
      max_rating: '9',
      min_time: `${minTime}`,
      max_time: `${maxTime}`,
    }
    const validationResult = validateReviewListFilter({ ...validQuery })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      minRating: 5,
      maxRating: 9,
      minTime: new Date(minTime),
      maxTime: new Date(maxTime),
    })
  })

  const validFilterQuery: ReviewListFilterQuery = {
    min_rating: '5',
    max_rating: '9',
    min_time: '1678334400000',
    max_time: '253370764800000',
  }

  const invalidFilterCases: Array<Record<string, unknown>> = [
    { ...validFilterQuery, min_rating: 'invalid' },
    { ...validFilterQuery, max_rating: 'invalid' },
    { ...validFilterQuery, min_time: 'invalid' },
    { ...validFilterQuery, max_time: 'invalid' },
    { ...validFilterQuery, min_rating: '3' },
    { ...validFilterQuery, max_rating: '11' },
    { ...validFilterQuery, min_time: 123 },
    { ...validFilterQuery, max_time: 123 },
  ]

  invalidFilterCases.forEach((testCase) => {
    it(`fails with min_rating ${testCase.min_rating} max_rating ${
      testCase.max_rating
    } min_time ${testCase.min_time} max_time ${testCase.max_time}`, () => {
      const validationResult = validateReviewListFilter({ ...testCase })
      assertEqual(
        validationResult.errorCode,
        'invalid-review-list-query-filter',
      )
      assertEqual(validationResult.result, undefined)
    })
  })
})
