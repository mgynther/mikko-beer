import type {
  CreateReviewRequest,
  JoinedReview,
  UpdateReviewRequest,
  Review,
  CreateIf,
  UpdateIf,
  ReviewListRequest,
} from '../../review/review.js'

import {
  referredBeerNotFoundError,
  referredContainerNotFoundError,
  referredStorageNotFoundError,
  reviewNotFoundError,
} from '../../errors.js'
import type { log } from '../../log.js'
import { INFO } from '../../log.js'
import type { Pagination } from '../../pagination.js'
import type { LockId } from '../../db.js'

export async function createReview(
  createIf: CreateIf,
  request: CreateReviewRequest,
  fromStorageId: string | undefined,
  log: log,
): Promise<Review> {
  if (fromStorageId === undefined) {
    log(INFO, 'create review for beer', request.beer)
  } else {
    log(INFO, 'create review for beer', request.beer, 'from storage')
  }
  await lockId(createIf.lockBeer, request.beer, referredBeerNotFoundError)
  await lockId(
    createIf.lockContainer,
    request.container,
    referredContainerNotFoundError,
  )
  if (typeof fromStorageId === 'string') {
    await lockId(
      createIf.lockStorage,
      fromStorageId,
      referredStorageNotFoundError,
    )
  }
  const review = await createIf.createReview({
    ...request,
    time: new Date(request.time),
  })

  if (typeof fromStorageId === 'string') {
    await createIf.deleteFromStorage(fromStorageId)
  }

  log(INFO, 'created review with id', review.id)
  return { ...review }
}

export async function updateReview(
  updateIf: UpdateIf,
  reviewId: string,
  request: UpdateReviewRequest,
  log: log,
): Promise<Review> {
  log(INFO, 'update review with id', reviewId)
  await lockId(updateIf.lockBeer, request.beer, referredBeerNotFoundError)
  await lockId(
    updateIf.lockContainer,
    request.container,
    referredContainerNotFoundError,
  )

  const review = await updateIf.updateReview({
    ...request,
    time: new Date(request.time),
    id: reviewId,
  })

  log(INFO, 'updated review with id', review.id)
  return { ...review }
}

export async function findReviewById(
  find: (id: string) => Promise<Review | undefined>,
  reviewId: string,
  log: log,
): Promise<Review> {
  log(INFO, 'find review with id', reviewId)
  const review = await find(reviewId)

  if (review === undefined) throw reviewNotFoundError(reviewId)

  return review
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
  log(INFO, 'list reviews', pagination, reviewListRequest)
  return await list(pagination, reviewListRequest)
}

export async function listReviewsByBeer(
  list: (
    beerId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  beerId: string,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  log(INFO, 'list by beer', beerId, reviewListRequest)
  return await list(beerId, reviewListRequest)
}

export async function listReviewsByBrewery(
  list: (
    breweryId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  breweryId: string,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  log(INFO, 'list by brewery', breweryId, reviewListRequest)
  return await list(breweryId, reviewListRequest)
}

export async function listReviewsByLocation(
  list: (
    locationId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  locationId: string,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  log(INFO, 'list by location', locationId, reviewListRequest)
  return await list(locationId, reviewListRequest)
}

export async function listReviewsByStyle(
  list: (
    styleId: string,
    reviewListRequest: ReviewListRequest,
  ) => Promise<JoinedReview[]>,
  styleId: string,
  reviewListRequest: ReviewListRequest,
  log: log,
): Promise<JoinedReview[]> {
  log(INFO, 'list by style', styleId, reviewListRequest)
  return await list(styleId, reviewListRequest)
}

async function lockId(
  lockId: LockId,
  key: string,
  error: Error,
): Promise<void> {
  const lockedId = await lockId(key)
  if (lockedId === undefined) {
    throw error
  }
}
