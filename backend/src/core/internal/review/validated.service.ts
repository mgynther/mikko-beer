import * as reviewService from './service'

import type {
  CreateIf,
  JoinedReview,
  Review,
  ReviewListOrder,
  UpdateIf
} from "../../review/review";
import {
  validateCreateReviewRequest,
  validateReviewId,
  validateUpdateReviewRequest
} from "./validation";
import type { log } from '../../log'
import type { Pagination } from '../../pagination';
import { validateBeerId } from '../beer/validation';
import { validateBreweryId } from '../brewery/validation';
import { validateStyleId } from '../style/validation';

export async function createReview (
  createIf: CreateIf,
  body: unknown,
  fromStorageId: string | undefined,
  log: log
): Promise<Review> {
  const createRequest = validateCreateReviewRequest(body)
  return await reviewService.createReview(
    createIf,
    createRequest,
    fromStorageId,
    log
  )
}

export async function updateReview (
  updateIf: UpdateIf,
  id: string | undefined,
  body: unknown,
  log: log
): Promise<Review> {
  const updateRequest = validateUpdateReviewRequest(body, id)
  return await reviewService.updateReview(
    updateIf,
    updateRequest.id,
    updateRequest.request,
    log
  )
}

export async function findReviewById (
  find: (id: string) => Promise<Review | undefined>,
  id: string | undefined,
  log: log
): Promise<Review> {
  return await reviewService.findReviewById(
    find,
    validateReviewId(id),
    log
  )
}

export async function listReviews (
  list: (
    pagination: Pagination,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  pagination: Pagination,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  return await reviewService.listReviews(
    list,
    pagination,
    reviewListOrder,
    log
  )
}

export async function listReviewsByBeer (
  list: (
    beerId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  beerId: string | undefined,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByBeer(
    list,
    validateBeerId(beerId),
    reviewListOrder,
    log
  )
}

export async function listReviewsByBrewery (
  list: (
    breweryId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  breweryId: string | undefined,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByBrewery(
    list,
    validateBreweryId(breweryId),
    reviewListOrder,
    log
  )
}

export async function listReviewsByStyle (
  list: (
    styleId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  styleId: string | undefined,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  return await reviewService.listReviewsByStyle(
    list,
    validateStyleId(styleId),
    reviewListOrder,
    log
  )
}
