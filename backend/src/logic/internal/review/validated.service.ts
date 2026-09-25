import * as reviewService from './service.js'

import type {
  CreateIf,
  JoinedReview,
  Review,
  FullReviewListRequest,
  ReviewListRequest,
  UpdateIf,
  ValidateCreateReview,
  ValidateReviewId,
  ValidateUpdateReview,
} from '../../review/review.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
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
  fromStorageId: string | undefined,
  log: log,
): Promise<Review> {
  const validationResult = validate(body)
  if (validationResult.errorCode === 'invalid-review') {
    throw invalidReviewError
  }
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
  pagination: Pagination,
  reviewListRequest: FullReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  return await reviewService.listReviews(
    list,
    pagination,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByBeer(
  list: (
    beerId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateBeerId: ValidateBeerId,
  beerId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  const idResult = validateBeerId(beerId)
  if (idResult.errorCode === 'invalid-beer-id') {
    throw invalidBeerIdError
  }
  return await reviewService.listReviewsByBeer(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByBrewery(
  list: (
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateBreweryId: ValidateBreweryId,
  breweryId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  const idResult = validateBreweryId(breweryId)
  if (idResult.errorCode === 'invalid-brewery-id') {
    throw invalidBreweryIdError
  }
  return await reviewService.listReviewsByBrewery(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByLocation(
  list: (
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateLocationId: ValidateLocationId,
  locationId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  const idResult = validateLocationId(locationId)
  if (idResult.errorCode === 'invalid-location-id') {
    throw invalidLocationIdError
  }
  return await reviewService.listReviewsByLocation(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByStyle(
  list: (
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateStyleId: ValidateStyleId,
  styleId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  const idResult = validateStyleId(styleId)
  if (idResult.errorCode === 'invalid-style-id') {
    throw invalidStyleIdError
  }
  return await reviewService.listReviewsByStyle(
    list,
    idResult.result,
    reviewListRequest,
    log,
  )
}
