import * as authorizationService from '../internal/auth/authorization.service.js'
import * as reviewService from '../internal/review/validated.service.js'

import type {
  CreateIf,
  JoinedReview,
  Review,
  ReviewListRequest,
  UpdateIf,
} from './review'
import type { log } from '../log.js'
import type { BodyRequest, IdRequest } from '../request'
import type { Pagination } from '../pagination'
import type { AuthTokenPayload } from '../auth/auth-token'

export async function createReview(
  createIf: CreateIf,
  request: BodyRequest,
  fromStorageId: string | undefined,
  log: log,
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await reviewService.createReview(
    createIf,
    request.body,
    fromStorageId,
    log,
  )
}

export async function updateReview(
  updateIf: UpdateIf,
  request: IdRequest,
  body: unknown,
  log: log,
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await reviewService.updateReview(updateIf, request.id, body, log)
}

export async function findReviewById(
  find: (id: string) => Promise<Review | undefined>,
  request: IdRequest,
  log: log,
): Promise<Review> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.findReviewById(find, request.id, log)
}

export async function listReviews(
  list: (
    pagination: Pagination,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(authTokenPayload)
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
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBeer(
    list,
    request.id,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByBrewery(
  list: (
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBrewery(
    list,
    request.id,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByLocation(
  list: (
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByLocation(
    list,
    request.id,
    reviewListRequest,
    log,
  )
}

export async function listReviewsByStyle(
  list: (
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByStyle(
    list,
    request.id,
    reviewListRequest,
    log,
  )
}
