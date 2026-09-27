import * as authorizationService from '../internal/auth/authorization.service.js'
import * as reviewService from '../internal/review/validated.service.js'

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
  ValidateFilteredReviewList,
  ValidateFullReviewList,
  ValidateCreateReview,
  ValidateReviewId,
  ValidateUpdateReview,
} from './review'
import type { log } from '../log.js'
import type { BodyRequest, IdRequest } from '../request'
import type { Pagination, PaginationQuery } from '../pagination'
import type { AuthTokenPayload } from '../auth/auth-token'
import type { ValidateBeerId } from '../beer/beer.js'
import type { ValidateBreweryId } from '../brewery/brewery.js'
import type { ValidateLocationId } from '../location/location.js'
import type { ValidateStyleId } from '../style/style.js'

export async function createReview(
  createIf: CreateIf,
  validate: ValidateCreateReview,
  request: BodyRequest,
  fromStorage: string | undefined,
  log: log,
): Promise<Review> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  return await reviewService.createReview(
    createIf,
    validate,
    request.body,
    fromStorage,
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
  validate: ValidateFullReviewList,
  authTokenPayload: AuthTokenPayload,
  paginationQuery: PaginationQuery,
  query: ReviewListQuery,
  log: log,
): Promise<ReviewList> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await reviewService.listReviews(
    list,
    validate,
    paginationQuery,
    query,
    log,
  )
}

export async function listReviewsByBeer(
  list: (
    beerId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateBeerId: ValidateBeerId,
  validate: ValidateFilteredReviewList,
  request: IdRequest,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBeer(
    list,
    validateBeerId,
    validate,
    request.id,
    query,
    log,
  )
}

export async function listReviewsByBrewery(
  list: (
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateBreweryId: ValidateBreweryId,
  validate: ValidateFilteredReviewList,
  request: IdRequest,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByBrewery(
    list,
    validateBreweryId,
    validate,
    request.id,
    query,
    log,
  )
}

export async function listReviewsByLocation(
  list: (
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateLocationId: ValidateLocationId,
  validate: ValidateFilteredReviewList,
  request: IdRequest,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByLocation(
    list,
    validateLocationId,
    validate,
    request.id,
    query,
    log,
  )
}

export async function listReviewsByStyle(
  list: (
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  validateStyleId: ValidateStyleId,
  validate: ValidateFilteredReviewList,
  request: IdRequest,
  query: ReviewListQuery,
  log: log,
): Promise<FilteredReviewList> {
  authorizationService.authorizeViewer(request.authTokenPayload)
  return await reviewService.listReviewsByStyle(
    list,
    validateStyleId,
    validate,
    request.id,
    query,
    log,
  )
}
