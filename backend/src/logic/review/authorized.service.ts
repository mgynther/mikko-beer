import * as authorizationService from '../internal/auth/authorization.service.js'
import * as reviewService from '../internal/review/validated.service.js'

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
} from './review'
import type { log } from '../log.js'
import type { BodyRequest, IdRequest } from '../request'
import type { Pagination } from '../pagination'
import type { AuthTokenPayload } from '../auth/auth-token'
import type { ValidateBeerId } from '../beer/beer.js'
import type { ValidateBreweryId } from '../brewery/brewery.js'
import type { ValidateLocationId } from '../location/location.js'
import type { ValidateStyleId } from '../style/style.js'

export async function createReview(
  createIf: CreateIf,
  validate: ValidateCreateReview,
  request: BodyRequest,
  fromStorageId: string | undefined,
  log: log,
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await reviewService.createReview(
    createIf,
    validate,
    request.body,
    fromStorageId,
    log,
  )
}

export async function updateReview(
  updateIf: UpdateIf,
  validate: ValidateUpdateReview,
  request: IdRequest,
  body: unknown,
  log: log,
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await reviewService.updateReview(
    updateIf,
    validate,
    request.id,
    body,
    log,
  )
}

export async function findReviewById(
  find: (id: string) => Promise<Review | undefined>,
  validateReviewId: ValidateReviewId,
  request: IdRequest,
  log: log,
): Promise<Review> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.findReviewById(
    find,
    validateReviewId,
    request.id,
    log,
  )
}

export async function listReviews(
  list: (
    pagination: Pagination,
    reviewListRequest: FullReviewListRequest,
  ) => Promise<JoinedReview[]>,
  authTokenPayload: AuthTokenPayload,
  pagination: Pagination,
  reviewListRequest: FullReviewListRequest,
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
  validateBeerId: ValidateBeerId,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBeer(
    list,
    validateBeerId,
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
  validateBreweryId: ValidateBreweryId,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBrewery(
    list,
    validateBreweryId,
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
  validateLocationId: ValidateLocationId,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByLocation(
    list,
    validateLocationId,
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
  validateStyleId: ValidateStyleId,
  request: IdRequest,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByStyle(
    list,
    validateStyleId,
    request.id,
    reviewListRequest,
    log,
  )
}
