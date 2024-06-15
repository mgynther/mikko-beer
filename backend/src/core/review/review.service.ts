import {
  type CreateReviewRequest,
  type JoinedReview,
  type UpdateReviewRequest,
  type Review,
  type ReviewListOrder,
  type NewReview
} from './review'

import {
  type Pagination
} from '../pagination'

export async function createReview (
  create: (review: NewReview) => Promise<Review>,
  deleteFromStorage: (storageId: string) => Promise<void>,
  request: CreateReviewRequest,
  fromStorageId: string | undefined
): Promise<Review> {
  const review = await create({
    ...request
  })

  if (typeof fromStorageId === 'string') {
    await deleteFromStorage(fromStorageId)
  }

  return { ...review }
}

export async function updateReview (
  update: (review: Review) => Promise<Review>,
  reviewId: string,
  request: UpdateReviewRequest
): Promise<Review> {
  const review = await update({
    ...request,
    id: reviewId
  })

  return { ...review }
}

export async function findReviewById (
  find: (id: string) => Promise<Review | undefined>,
  reviewId: string
): Promise<Review | undefined> {
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
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return await list(pagination, reviewListOrder)
}

export async function listReviewsByBeer (
  list: (
    beerId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  beerId: string,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return await list(beerId, reviewListOrder)
}

export async function listReviewsByBrewery (
  list: (
    breweryId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  breweryId: string,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return await list(breweryId, reviewListOrder)
}

export async function listReviewsByStyle (
  list: (
    styleId: string,
    reviewListOrder: ReviewListOrder
  ) => Promise<JoinedReview[]>,
  styleId: string,
  reviewListOrder: ReviewListOrder
): Promise<JoinedReview[]> {
  return await list(styleId, reviewListOrder)
}
