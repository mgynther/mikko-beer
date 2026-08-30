import * as reviewService from './service.js'

import type {
  CreateIf,
  JoinedReview,
  Review,
  ReviewListRequest,
  UpdateIf,
} from '../../review/review.js'
import {
  validateCreateReviewRequest,
  validateReviewId,
  validateUpdateReviewRequest,
} from './validation.js'
import type { log } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import { validateBeerId } from '../beer/validation.js'
import { validateBreweryId } from '../brewery/validation.js'
import { validateLocationId } from '../location/validation.js'
import { validateStyleId } from '../style/validation.js'

export async function createReview(
  createIf: CreateIf,
  body: unknown,
  fromStorageId: string | undefined,
  log: log,
): Promise<Review> {
  const createRequest = validateCreateReviewRequest(body)
  return await reviewService.createReview(
    createIf,
    createRequest,
    fromStorageId,
    log,
  )
}

export async function updateReview(
  updateIf: UpdateIf,
  id: string | undefined,
  body: unknown,
  log: log,
): Promise<Review> {
  const updateRequest = validateUpdateReviewRequest(body, id)
  return await reviewService.updateReview(
    updateIf,
    updateRequest.id,
    updateRequest.request,
    log,
  )
}

export async function findReviewById(
  find: (id: string) => Promise<Review | undefined>,
  id: string | undefined,
  log: log,
): Promise<Review> {
  return await reviewService.findReviewById(find, validateReviewId(id), log)
}

export async function listReviews(
  list: (
    pagination: Pagination,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  pagination: Pagination,
  reviewListRequest: ReviewListRequest,
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
  beerId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByBeer(
    list,
    validateBeerId(beerId),
    reviewListRequest,
    log,
  )
}

export async function listReviewsByBrewery(
  list: (
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  breweryId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByBrewery(
    list,
    validateBreweryId(breweryId),
    reviewListRequest,
    log,
  )
}

export async function listReviewsByLocation(
  list: (
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  locationId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByLocation(
    list,
    validateLocationId(locationId),
    reviewListRequest,
    log,
  )
}

export async function listReviewsByStyle(
  list: (
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  styleId: string | undefined,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByStyle(
    list,
    validateStyleId(styleId),
    reviewListRequest,
    log,
  )
}
