import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'
import type { Container } from './container'
import { ValidatedContainer, toContainer } from './container'
import type { Location } from './location'
import { ValidatedLocation, toLocation } from './location'

// This layer's own view of a valid review, declared here rather than
// imported from types/. See the comment in style.ts.
export interface Review {
  id: string
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  smell: string
  taste: string
  time: string
}

interface JoinedReviewBrewery {
  id: string
  name: string
}

interface JoinedReviewStyle {
  id: string
  name: string
}

export interface JoinedReview {
  id: string
  additionalInfo: string
  beerId: string
  beerName: string
  breweries: JoinedReviewBrewery[]
  container: Container
  location: Location | undefined
  rating: number
  styles: JoinedReviewStyle[]
  time: string
}

export type ReviewSortingOrder =
  'beer_name' | 'brewery_name' | 'rating' | 'time'

export type ListDirection = 'asc' | 'desc'

export interface ReviewSorting {
  order: ReviewSortingOrder
  direction: ListDirection
}

export interface JoinedReviewList {
  reviews: JoinedReview[]
  sorting: ReviewSorting
}

const ValidatedReview = t.type({
  id: t.string,
  additionalInfo: t.string,
  beer: t.string,
  container: t.string,
  location: t.string,
  rating: t.number,
  smell: t.string,
  taste: t.string,
  time: t.string,
})

const ValidatedJoinedReviewBrewery = t.type({
  id: t.string,
  name: t.string,
})

const ValidatedJoinedReviewStyle = t.type({
  id: t.string,
  name: t.string,
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
  time: t.string,
})

const ValidatedSorting = t.type({
  order: t.union([
    t.literal('beer_name'),
    t.literal('brewery_name'),
    t.literal('rating'),
    t.literal('time'),
  ]),
  direction: t.union([t.literal('asc'), t.literal('desc')]),
})

const ValidatedJoinedReviewList = t.type({
  reviews: t.array(ValidatedJoinedReview),
  sorting: ValidatedSorting,
})

function toJoinedReviewBrewery(
  brewery: t.TypeOf<typeof ValidatedJoinedReviewBrewery>,
): JoinedReviewBrewery {
  return {
    id: brewery.id,
    name: brewery.name,
  }
}

function toJoinedReviewStyle(
  style: t.TypeOf<typeof ValidatedJoinedReviewStyle>,
): JoinedReviewStyle {
  return {
    id: style.id,
    name: style.name,
  }
}

// A location missing from the response is an explicit undefined from here on,
// so that no layer can forget to pass it along.
function toJoinedReview(
  review: t.TypeOf<typeof ValidatedJoinedReview>,
): JoinedReview {
  return {
    id: review.id,
    additionalInfo: review.additionalInfo,
    beerId: review.beerId,
    beerName: review.beerName,
    breweries: review.breweries.map(toJoinedReviewBrewery),
    container: toContainer(review.container),
    location:
      review.location === undefined ? undefined : toLocation(review.location),
    rating: review.rating,
    styles: review.styles.map(toJoinedReviewStyle),
    time: review.time,
  }
}

function toSorting(sorting: t.TypeOf<typeof ValidatedSorting>): ReviewSorting {
  return {
    order: sorting.order,
    direction: sorting.direction,
  }
}

export function validateReviewOrUndefined(result: unknown): Review | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateReview(result)
}

export function validateReview(result: unknown): Review {
  const decoded = ValidatedReview.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const review = decoded.right
  return {
    id: review.id,
    additionalInfo: review.additionalInfo,
    beer: review.beer,
    container: review.container,
    location: review.location,
    rating: review.rating,
    smell: review.smell,
    taste: review.taste,
    time: review.time,
  }
}

export function validateJoinedReviewListOrUndefined(
  result: unknown,
): JoinedReviewList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateJoinedReviewList(result)
}

export function validateJoinedReviewList(result: unknown): JoinedReviewList {
  const decoded = ValidatedJoinedReviewList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    reviews: decoded.right.reviews.map(toJoinedReview),
    sorting: toSorting(decoded.right.sorting),
  }
}
