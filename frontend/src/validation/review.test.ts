import { expect, test } from 'vitest'

import type {
  JoinedReview,
  JoinedReviewList,
  Review,
} from '../core/review/types'

import {
  validateReview,
  validateReviewOrUndefined,
  validateJoinedReviewList,
  validateJoinedReviewListOrUndefined,
} from './review'

const validReview: Review = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  additionalInfo: 'Delicious summer ale',
  beer: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  container: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  location: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  rating: 9,
  smell: 'Citrusy hops',
  taste: 'Refreshing with mild bitterness',
  time: '2024-06-15T18:30:00.000Z',
}

test('validateReview returns review for valid input', () => {
  expect(validateReview(validReview)).toEqual(validReview)
})

test('validateReview throws for invalid input', () => {
  expect(() =>
    validateReview({
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      rating: 'not a number',
    }),
  ).toThrow()
})

test('validateReviewOrUndefined returns undefined for undefined', () => {
  expect(validateReviewOrUndefined(undefined)).toEqual(undefined)
})

test('validateReviewOrUndefined returns review for valid input', () => {
  expect(validateReviewOrUndefined(validReview)).toEqual(validReview)
})

test('validateReviewOrUndefined throws for invalid input', () => {
  expect(() =>
    validateReviewOrUndefined({
      id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    }),
  ).toThrow()
})

test('validateJoinedReviewListOrUndefined returns undefined', () => {
  expect(validateJoinedReviewListOrUndefined(undefined)).toEqual(undefined)
})

const validJoinedReview: JoinedReview = {
  id: '11223344-5566-7788-99aa-bbccddeeff00',
  additionalInfo: 'A great IPA',
  beerId: '22334455-6677-8899-aabb-ccddeeff0011',
  beerName: 'Kansen IPA',
  breweries: [
    {
      id: '33445566-7788-99aa-bbcc-ddeeff001122',
      name: 'Kansen Brewing',
    },
  ],
  container: {
    id: '44556677-8899-aabb-ccdd-eeff00112233',
    type: 'bottle',
    size: '0.33',
  },
  location: {
    id: '55667788-99aa-bbcc-ddee-ff0011223344',
    name: 'Kuja Beer Shop & Bar',
  },
  rating: 8,
  styles: [
    {
      id: '66778899-aabb-ccdd-eeff-001122334455',
      name: 'IPA',
    },
  ],
  time: '2024-07-20T19:00:00.000Z',
}

test('validateJoinedReviewListOrUndefined returns list for valid input', () => {
  const list: JoinedReviewList = {
    reviews: [validJoinedReview],
    sorting: {
      order: 'beer_name',
      direction: 'asc',
    },
  }
  expect(validateJoinedReviewListOrUndefined(list)).toEqual(list)
})

test('validateJoinedReviewListOrUndefined throws for invalid input', () => {
  expect(() =>
    validateJoinedReviewListOrUndefined({
      reviews: [{ id: 123 }],
    }),
  ).toThrow()
})

test('validateJoinedReviewList returns list for valid input', () => {
  const list: JoinedReviewList = {
    reviews: [validJoinedReview],
    sorting: {
      order: 'brewery_name',
      direction: 'desc',
    },
  }
  expect(validateJoinedReviewList(list)).toEqual(list)
})

test('validateJoinedReviewList throws for invalid input', () => {
  expect(() =>
    validateJoinedReviewList({
      reviews: [{ id: 123 }],
    }),
  ).toThrow()
})
