import * as reviewService from '../../logic/review/authorized.service.js'
import type {
  CreateIf,
  FilteredReviewList,
  FullReviewListRequest,
  JoinedReview,
  NewReview,
  Review,
  ReviewListRequest,
  UpdateIf,
  ValidateFilteredReviewList,
  ValidateFullReviewList,
} from '../../logic/review/review.js'
import type { AuthTokenPayload } from '../../logic/auth/auth-token.js'
import type { Pagination } from '../../logic/pagination.js'

import * as beerRepository from '../../data/beer/beer.repository.js'
import * as containerRepository from '../../data/container/container.repository.js'
import type { Transaction } from '../../data/database.js'
import * as reviewRepository from '../../data/review/review.repository.js'
import * as storageRepository from '../../data/storage/storage.repository.js'

import { validateBeerId } from '../../validation/beer.js'
import { validateBreweryId } from '../../validation/brewery.js'
import { validateLocationId } from '../../validation/location.js'
import { validatePagination } from '../../validation/pagination.js'
import {
  validateCreateReviewRequest,
  validateFilteredReviewListOrder,
  validateFullReviewListOrder,
  validateReviewId,
  validateReviewListFilter,
  validateUpdateReviewRequest,
} from '../../validation/review.js'
import { validateStyleId } from '../../validation/style.js'

import type {
  CreateReviewRequest,
  CreatedOrUpdatedReview,
  FilteredReviewListBody,
  ListReviewsByIdRequest,
  ListReviewsRequest,
  ListedReview,
  ReadReview,
  ReadReviewBody,
  ReviewBody,
  ReviewHandlers,
  ReviewListBody,
} from '../../web/review/review.js'
import type { IdBodyRequest, IdRequest } from '../../web/request.js'

import { authenticated } from '../authentication/authenticated.js'
import type { Context } from '../context.js'

const validateFilteredReviewList: ValidateFilteredReviewList = {
  order: validateFilteredReviewListOrder,
  filter: validateReviewListFilter,
}

const validateFullReviewList: ValidateFullReviewList = {
  order: validateFullReviewListOrder,
  filter: validateReviewListFilter,
  pagination: validatePagination,
}

export function createReviewHandlers(context: Context): ReviewHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: CreateReviewRequest,
      ): Promise<ReviewBody> => {
        const review = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Review> => {
            const createIf: CreateIf = {
              createReview: async (review: NewReview): Promise<Review> =>
                await reviewRepository.insertReview(trx, review),
              deleteFromStorage: async (storageId: string): Promise<void> => {
                await storageRepository.deleteStorageById(trx, storageId)
              },
              lockBeer: async (id: string): Promise<string | undefined> =>
                await beerRepository.lockBeer(trx, id),
              lockContainer: async (id: string): Promise<string | undefined> =>
                await containerRepository.lockContainer(trx, id),
              lockStorage: async (id: string): Promise<string | undefined> =>
                await storageRepository.lockStorage(trx, id),
            }
            return await reviewService.createReview(
              createIf,
              validateCreateReviewRequest,
              { authTokenPayload, body: request.body },
              request.storage,
              log,
            )
          },
        )
        return { review: toCreatedOrUpdatedReview(review) }
      },
    ),

    update: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<ReviewBody> => {
        const review = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<Review> => {
            const updateIf: UpdateIf = {
              updateReview: async (review: Review): Promise<Review> =>
                await reviewRepository.updateReview(trx, review),
              lockBeer: async (id: string): Promise<string | undefined> =>
                await beerRepository.lockBeer(trx, id),
              lockContainer: async (id: string): Promise<string | undefined> =>
                await containerRepository.lockContainer(trx, id),
            }
            return await reviewService.updateReview(
              updateIf,
              validateUpdateReviewRequest,
              { authTokenPayload, id: request.id },
              request.body,
              log,
            )
          },
        )
        return { review: toCreatedOrUpdatedReview(review) }
      },
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadReviewBody> => {
        const review = await reviewService.findReviewById(
          async (reviewId: string): Promise<Review | undefined> =>
            await reviewRepository.findReviewById(db, reviewId),
          validateReviewId,
          { authTokenPayload, id: request.id },
          log,
        )
        return { review: toReadReview(review) }
      },
    ),

    listByBeer: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: ListReviewsByIdRequest,
      ): Promise<FilteredReviewListBody> => {
        const reviewList = await reviewService.listReviewsByBeer(
          async (
            beerId: string,
            reviewListRequest: ReviewListRequest,
          ): Promise<JoinedReview[]> =>
            await reviewRepository.listReviewsByBeer(
              db,
              beerId,
              reviewListRequest,
            ),
          validateBeerId,
          validateFilteredReviewList,
          { authTokenPayload, id: request.id },
          request.list,
          log,
        )
        return toFilteredReviewListBody(reviewList)
      },
    ),

    listByBrewery: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: ListReviewsByIdRequest,
      ): Promise<FilteredReviewListBody> => {
        const reviewList = await reviewService.listReviewsByBrewery(
          async (
            breweryId: string,
            reviewListRequest: ReviewListRequest,
          ): Promise<JoinedReview[]> =>
            await reviewRepository.listReviewsByBrewery(
              db,
              breweryId,
              reviewListRequest,
            ),
          validateBreweryId,
          validateFilteredReviewList,
          { authTokenPayload, id: request.id },
          request.list,
          log,
        )
        return toFilteredReviewListBody(reviewList)
      },
    ),

    listByLocation: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: ListReviewsByIdRequest,
      ): Promise<FilteredReviewListBody> => {
        const reviewList = await reviewService.listReviewsByLocation(
          async (
            locationId: string,
            reviewListRequest: ReviewListRequest,
          ): Promise<JoinedReview[]> =>
            await reviewRepository.listReviewsByLocation(
              db,
              locationId,
              reviewListRequest,
            ),
          validateLocationId,
          validateFilteredReviewList,
          { authTokenPayload, id: request.id },
          request.list,
          log,
        )
        return toFilteredReviewListBody(reviewList)
      },
    ),

    listByStyle: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: ListReviewsByIdRequest,
      ): Promise<FilteredReviewListBody> => {
        const reviewList = await reviewService.listReviewsByStyle(
          async (
            styleId: string,
            reviewListRequest: ReviewListRequest,
          ): Promise<JoinedReview[]> =>
            await reviewRepository.listReviewsByStyle(
              db,
              styleId,
              reviewListRequest,
            ),
          validateStyleId,
          validateFilteredReviewList,
          { authTokenPayload, id: request.id },
          request.list,
          log,
        )
        return toFilteredReviewListBody(reviewList)
      },
    ),

    list: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: ListReviewsRequest,
      ): Promise<ReviewListBody> => {
        const reviewList = await reviewService.listReviews(
          async (
            pagination: Pagination,
            reviewListRequest: FullReviewListRequest,
          ): Promise<JoinedReview[]> =>
            await reviewRepository.listReviews(
              db,
              pagination,
              reviewListRequest,
            ),
          validateFullReviewList,
          authTokenPayload,
          request.pagination,
          request.list,
          log,
        )
        return {
          reviews: reviewList.reviews.map(toListedReview),
          pagination: reviewList.pagination,
          sorting: {
            order: reviewList.order.property,
            direction: reviewList.order.direction,
          },
        }
      },
    ),
  }
}

function toFilteredReviewListBody(
  reviewList: FilteredReviewList,
): FilteredReviewListBody {
  return {
    reviews: reviewList.reviews.map(toListedReview),
    sorting: {
      order: reviewList.order.property,
      direction: reviewList.order.direction,
    },
  }
}

function toCreatedOrUpdatedReview(review: Review): CreatedOrUpdatedReview {
  return {
    ...review,
    time: review.time.toISOString(),
  }
}

function toReadReview(review: Review): ReadReview {
  return {
    ...review,
    time: review.time.toISOString(),
  }
}

function toListedReview(review: JoinedReview): ListedReview {
  return {
    ...review,
    time: review.time.toISOString(),
  }
}
