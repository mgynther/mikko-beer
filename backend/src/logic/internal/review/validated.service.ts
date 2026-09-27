import * as reviewService from './service.js'

import type {
  CreateIf,
  FilteredReviewList,
  FullReviewListRequest,
  JoinedReview,
  Review,
  ReviewList,
  ReviewListQuery,
  ReviewListRequest,
  UpdateIf,
  ValidateCreateReview,
  ValidateFilteredReviewList,
  ValidateFullReviewList,
  ValidateReviewId,
  ValidateUpdateReview,
} from '../../review/review.js'
import type { log } from '../../log.js'
import type { Pagination, PaginationQuery } from '../../pagination.js'
import { validPagination } from '../pagination.js'
import {
  validFilteredReviewListRequest,
  validFullReviewListRequest,
} from './list-query.js'
import type { ValidateBeerId } from '../../beer/beer.js'
import type { ValidateLocationId } from '../../location/location.js'
import type { ValidateBreweryId } from '../../brewery/brewery.js'
import {
  invalidBreweryIdError,
  invalidBeerIdError,
  invalidLocationIdError,
  invalidReviewError,
  invalidReviewIdError,
  invalidStyleIdError,
} from '../../errors.js'
import type { ValidateStyleId } from '../../style/style.js'

export async function createReview(
  createIf: CreateIf,
  validate: ValidateCreateReview,
  body: unknown,
  fromStorage: string | undefined,
  log: log,
): Promise<Review> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-review') {
    throw invalidReviewError
  }
  const fromStorageId = fromStorage === '' ? undefined : fromStorage
  return await reviewService.createReview(
    createIf,
    validationResult.result,
    fromStorageId,
    log,
  )
}

export async function updateReview(
  updateIf: UpdateIf,
  validate: ValidateUpdateReview,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<Review> {
  const validationResult = validate(body, id)
  if (validationResult.errorCode !== undefined) {
    switch (validationResult.errorCode) {
      case 'invalid-review':
        throw invalidReviewError
      case 'invalid-review-id':
        throw invalidReviewIdError
    }
  }
  return await reviewService.updateReview(
    updateIf,
    validationResult.result.id,
    validationResult.result.request,
    log,
  )
}

export async function findReviewById(
  find: (id: string) => Promise<Review | undefined>,
  validateReviewId: ValidateReviewId,
  id: string | undefined,
  log: log,
): Promise<Review> {
  const idResult = validateReviewId(id)
  if (idResult.errorCode === 'invalid-review-id') {
    throw invalidReviewIdError
  }
  return await reviewService.findReviewById(find, idResult.result, log)
}

export async function listReviews(
  list: (
    pagination: Pagination,
    reviewListRequest: FullReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validate: ValidateFullReviewList,
  paginationQuery: PaginationQuery,
  query: ReviewListQuery,
  log: log,
): Promise<ReviewList> {
  const reviewListRequest = validFullReviewListRequest(validate, query)
  const pagination = validPagination(validate.pagination, paginationQuery)
  const reviews = await reviewService.listReviews(
    list,
    pagination,
    reviewListRequest,
    log,
  )
  return { reviews, pagination, order: reviewListRequest.order }
}

export async function listReviewsByBeer(
  list: (
    beerId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateBeerId: ValidateBeerId,
  validate: ValidateFilteredReviewList,
  beerId: string | undefined,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  const reviewListRequest = validFilteredReviewListRequest(validate, query)
  const idResult = validateBeerId(beerId)
  if (idResult.errorCode === 'invalid-beer-id') {
    throw invalidBeerIdError
  }
  const reviews = await reviewService.listReviewsByBeer(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
  return { reviews, order: reviewListRequest.order }
}

export async function listReviewsByBrewery(
  list: (
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateBreweryId: ValidateBreweryId,
  validate: ValidateFilteredReviewList,
  breweryId: string | undefined,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  const reviewListRequest = validFilteredReviewListRequest(validate, query)
  const idResult = validateBreweryId(breweryId)
  if (idResult.errorCode === 'invalid-brewery-id') {
    throw invalidBreweryIdError
  }
  const reviews = await reviewService.listReviewsByBrewery(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
  return { reviews, order: reviewListRequest.order }
}

export async function listReviewsByLocation(
  list: (
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateLocationId: ValidateLocationId,
  validate: ValidateFilteredReviewList,
  locationId: string | undefined,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  const reviewListRequest = validFilteredReviewListRequest(validate, query)
  const idResult = validateLocationId(locationId)
  if (idResult.errorCode === 'invalid-location-id') {
    throw invalidLocationIdError
  }
  const reviews = await reviewService.listReviewsByLocation(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
  return { reviews, order: reviewListRequest.order }
}

export async function listReviewsByStyle(
  list: (
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateStyleId: ValidateStyleId,
  validate: ValidateFilteredReviewList,
  styleId: string | undefined,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  const reviewListRequest = validFilteredReviewListRequest(validate, query)
  const idResult = validateStyleId(styleId)
  if (idResult.errorCode === 'invalid-style-id') {
    throw invalidStyleIdError
  }
  const reviews = await reviewService.listReviewsByStyle(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
  return { reviews, order: reviewListRequest.order }
}
