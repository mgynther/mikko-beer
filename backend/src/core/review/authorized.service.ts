import * as authorizationService from '../internal/auth/authorization.service'
import * as reviewService from '../internal/review/validated.service'

import type {
  CreateIf,
  JoinedReview,
  Review,
  ReviewListOrder,
  UpdateIf
} from "./review";
import type { log } from '../log'
import type { BodyRequest, IdRequest } from '../request';
import type { Pagination } from '../pagination';
import type { AuthTokenPayload } from '../auth/auth-token';

export async function createReview (
  createIf: CreateIf,
  request: BodyRequest,
  fromStorageId: string | undefined,
  log: log
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await reviewService.createReview(
    createIf,
    request.body,
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
  return await reviewService.updateReview(
    updateIf,
    request.id,
    body,
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
    request.id,
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
    request.id,
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
    request.id,
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
    request.id,
    reviewListOrder,
    log
  )
}
