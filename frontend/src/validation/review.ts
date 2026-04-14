import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type {
  JoinedReviewList,
  Review,
} from '../core/review/types'
import { formatError } from './format-error'
import { ValidatedContainer } from './container'
import { ValidatedLocation } from './location'

const ValidatedReview = t.type({
  id: t.string,
  additionalInfo: t.string,
  beer: t.string,
  container: t.string,
  location: t.string,
  rating: t.number,
  smell: t.string,
  taste: t.string,
  time: t.string
})

const ValidatedJoinedReviewBrewery = t.type({
  id: t.string,
  name: t.string
})

const ValidatedJoinedReviewStyle = t.type({
  id: t.string,
  name: t.string
})

const ValidatedJoinedReview = t.type({
  id: t.string,
  additionalInfo: t.string,
  beerId: t.string,
  beerName: t.string,
  breweries: t.array(ValidatedJoinedReviewBrewery),
  container: ValidatedContainer,
  location: t.union([ValidatedLocation, t.undefined]),
  rating: t.number,
  styles: t.array(ValidatedJoinedReviewStyle),
  time: t.string
})

const ValidatedSorting = t.type({
  order: t.union([
    t.literal('beer_name'),
    t.literal('brewery_name'),
    t.literal('rating'),
    t.literal('time')
  ]),
  direction: t.union([t.literal('asc'), t.literal('desc')])
})

const ValidatedJoinedReviewList = t.type({
  reviews: t.array(ValidatedJoinedReview),
  sorting: ValidatedSorting
})

export function validateReviewOrUndefined(
  result: unknown
): Review | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateReview(result)
}

export function validateReview(result: unknown): Review {
  type ReviewT = t.TypeOf<typeof ValidatedReview>
  const decoded = ValidatedReview.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: ReviewT = decoded.right
  return valid
}

export function validateJoinedReviewListOrUndefined(
  result: unknown
): JoinedReviewList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateJoinedReviewList(result)
}

export function validateJoinedReviewList(result: unknown): JoinedReviewList {
  type ReviewListT = t.TypeOf<typeof ValidatedJoinedReviewList>
  const decoded = ValidatedJoinedReviewList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: ReviewListT = decoded.right
  return {
    reviews: valid.reviews,
    sorting: valid.sorting
  }
}
