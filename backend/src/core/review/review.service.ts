import {
  type CreateReviewRequest,
  type JoinedReview,
  type UpdateReviewRequest,
  type Review,
  type ReviewListOrder,
  type NewReview
} from './review'

import { INFO, type log } from '../log'
import {
  type Pagination
} from '../pagination'

export class BeerNotFoundError extends Error {}
export class ContainerNotFoundError extends Error {}
export class StorageNotFoundError extends Error {}

type LockId = (id: string) => Promise<string | undefined>

export interface CreateIf {
  createReview: (review: NewReview) => Promise<Review>
  deleteFromStorage: (storageId: string) => Promise<void>
  lockBeer: LockId
  lockContainer: LockId
  lockStorage: LockId
}

export async function createReview (
  createIf: CreateIf,
  request: CreateReviewRequest,
  fromStorageId: string | undefined,
  log: log
): Promise<Review> {
  if (fromStorageId === undefined) {
    log(INFO, 'create review for beer', request.beer)
  } else {
    log(INFO, 'create review for beer', request.beer, 'from storage')
  }
  await lockId(createIf.lockBeer, request.beer, new BeerNotFoundError())
  await lockId(
    createIf.lockContainer,
    request.container,
    new ContainerNotFoundError()
  )
  if (typeof fromStorageId === 'string') {
    await lockId(
      createIf.lockStorage,
      fromStorageId,
      new StorageNotFoundError()
    )
  }
  const review = await createIf.createReview({
    ...request,
    time: new Date(request.time)
  })

  if (typeof fromStorageId === 'string') {
    await createIf.deleteFromStorage(fromStorageId)
  }

  log(INFO, 'created review with id', review.id)
  return { ...review }
}

export interface UpdateIf {
  updateReview: (review: Review) => Promise<Review>
  lockBeer: LockId
  lockContainer: LockId
}

export async function updateReview (
  updateIf: UpdateIf,
  reviewId: string,
  request: UpdateReviewRequest,
  log: log
): Promise<Review> {
  log(INFO, 'update review with id', reviewId)
  await lockId(updateIf.lockBeer, request.beer, new BeerNotFoundError())
  await lockId(
    updateIf.lockContainer,
    request.container,
    new ContainerNotFoundError()
  )

  const review = await updateIf.updateReview({
    ...request,
    time: new Date(request.time),
    id: reviewId
  })

  log(INFO, 'updated review with id', review.id)
  return { ...review }
}

export async function findReviewById (
  find: (id: string) => Promise<Review | undefined>,
  reviewId: string,
  log: log
): Promise<Review | undefined> {
  log(INFO, 'find review with id', reviewId)
  const review = await find(reviewId)

  if (review === undefined) return undefined

  return review
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
  log(INFO, 'list reviews', pagination, reviewListOrder)
  return await list(pagination, reviewListOrder)
}

export async function listReviewsByBeer (
  list: (
    beerId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  beerId: string,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  log(INFO, 'list by beer', beerId, reviewListOrder)
  return await list(beerId, reviewListOrder)
}

export async function listReviewsByBrewery (
  list: (
    breweryId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  breweryId: string,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  log(INFO, 'list by brewery', breweryId, reviewListOrder)
  return await list(breweryId, reviewListOrder)
}

export async function listReviewsByStyle (
  list: (
    styleId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  styleId: string,
  reviewListOrder: ReviewListOrder,
  log: log
): Promise<JoinedReview[]> {
  log(INFO, 'list by style', styleId, reviewListOrder)
  return await list(styleId, reviewListOrder)
}

async function lockId (
  lockId: LockId,
  key: string,
  error: Error
): Promise<void> {
  const lockedId = await lockId(key)
  if (lockedId === undefined) {
    throw error
  }
}
