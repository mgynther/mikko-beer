import * as authorizationService from '../../core/auth/authorization.service'
import * as reviewService from '../../core/review/review.service'

import type {
  CreateIf,
  JoinedReview,
  Review,
  ReviewListOrder,
  UpdateIf
} from "./review";
import {
  validateCreateReviewRequest,
  validateReviewId,
  validateUpdateReviewRequest
} from "./review";
import type { log } from '../log'
import type { BodyRequest, IdRequest } from '../request';
import type { Pagination } from '../pagination';
import type { AuthTokenPayload } from '../auth/auth-token';
import { validateBeerId } from '../beer/beer';
import { validateBreweryId } from '../brewery/brewery';
import { validateStyleId } from '../style/style';

export async function createReview (
  createIf: CreateIf,
  request: BodyRequest,
  fromStorageId: string | undefined,
  log: log
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  const createRequest = validateCreateReviewRequest(request.body)
  return await reviewService.createReview(
    createIf,
    createRequest,
    fromStorageId,
    log
  )
}

export async function updateReview (
  updateIf: UpdateIf,
  request: IdRequest,
  body: unknown,
  log: log
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  const updateRequest = validateUpdateReviewRequest(body, request.id)
  return await reviewService.updateReview(
    updateIf,
    updateRequest.id,
    updateRequest.request,
    log
  )
}

export async function findReviewById (
  find: (id: string) => Promise<Review | undefined>,
  request: IdRequest,
  log: log
): Promise<Review> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.findReviewById(
    find,
    validateReviewId(request.id),
    log
  )
}

export async function listReviews (
  list: (
    pagination: Pagination,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(authTokenPayload)
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
  request: IdRequest,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBeer(
    list,
    validateBeerId(request.id),
    reviewListOrder,
    log
  )
}

export async function listReviewsByBrewery (
  list: (
    breweryId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  request: IdRequest,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBrewery(
    list,
    validateBreweryId(request.id),
    reviewListOrder,
    log
  )
}

export async function listReviewsByStyle (
  list: (
    styleId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  request: IdRequest,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByStyle(
    list,
    validateStyleId(request.id),
    reviewListOrder,
    log
  )
}
