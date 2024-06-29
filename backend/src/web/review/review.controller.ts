import * as beerRepository from '../../data/beer/beer.repository'
import * as containerRepository from '../../data/container/container.repository'
import * as reviewRepository from '../../data/review/review.repository'
import * as storageRepository from '../../data/storage/storage.repository'
import * as reviewService from '../../core/review/review.service'
import * as authHelper from '../authentication/authentication-helper'

import { type Router } from '../router'
import { type Pagination } from '../../core/pagination'
import {
  type CreateReviewRequest,
  type NewReview,
  type Review,
  type UpdateReviewRequest,
  type ReviewListOrder,
  validateCreateReviewRequest,
  validateUpdateReviewRequest,
  validReviewListOrder
} from '../../core/review/review'
import { ControllerError } from '../../core/errors'
import { validatePagination } from '../pagination'
import {
  BeerNotFoundError,
  ContainerNotFoundError,
  StorageNotFoundError,
  type CreateIf,
  type UpdateIf
} from '../../core/review/review.service'

function handleError (e: unknown): void {
  if (e instanceof BeerNotFoundError) {
    throw new ControllerError(
      400,
      'BeerNotFound',
      'beer not found'
    )
  }
  if (e instanceof ContainerNotFoundError) {
    throw new ControllerError(
      400,
      'ContainerNotFound',
      'container not found'
    )
  }
  if (e instanceof StorageNotFoundError) {
    throw new ControllerError(
      400,
      'StorageNotFound',
      'storage not found'
    )
  }
  throw e
}

export function reviewController (router: Router): void {
  router.post('/api/v1/review',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { storage } = ctx.request.query

      try {
        const createReviewRequest = validateCreateRequest(body)
        const storageParam = typeof storage === 'string' &&
          storage.length > 0
          ? storage
          : undefined
        const result = await ctx.db.executeTransaction(async (trx) => {
          const createIf: CreateIf = {
            createReview: (
              review: NewReview
            ) => reviewRepository.insertReview(trx, review),
            deleteFromStorage: (
              storageId: string
            ) => storageRepository.deleteStorageById(
              trx, storageId),
            lockBeer: function(id: string): Promise<string | undefined> {
              return beerRepository.lockBeer(trx, id)
            },
            lockContainer: function(id: string): Promise<string | undefined> {
              return containerRepository.lockContainer(trx, id)
            },
            lockStorage: function(id: string): Promise<string | undefined> {
              return storageRepository.lockStorage(trx, id)
            }
          }
          return await reviewService.createReview(
            createIf,
            createReviewRequest,
            storageParam,
            ctx.log
          )
        })

        ctx.status = 201
        ctx.body = {
          review: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.put('/api/v1/review/:reviewId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { reviewId } = ctx.params

      try {
        const updateReviewRequest = validateUpdateRequest(body, reviewId)
        const result = await ctx.db.executeTransaction(async (trx) => {
          const updateIf: UpdateIf = {
            updateReview: (
              review: Review
            ) => reviewRepository.updateReview(trx, review),
            lockBeer: function(id: string): Promise<string | undefined> {
              return beerRepository.lockBeer(trx, id)
            },
            lockContainer: function(id: string): Promise<string | undefined> {
              return containerRepository.lockContainer(trx, id)
            }
          }
          return await reviewService.updateReview(
            updateIf,
            reviewId,
            updateReviewRequest,
            ctx.log
          )
        })

        ctx.status = 200
        ctx.body = {
          review: result
        }
      } catch (e) {
        handleError(e)
      }
    }
  )

  router.get(
    '/api/v1/review/:reviewId',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { reviewId } = ctx.params
      const review = await reviewService.findReviewById((reviewId: string) => {
        return reviewRepository.findReviewById(ctx.db, reviewId)
      }, reviewId, ctx.log)

      if (review === undefined) {
        throw new ControllerError(
          404,
          'ReviewNotFound',
          `review with id ${reviewId} was not found`
        )
      }

      ctx.body = { review }
    }
  )

  router.get(
    '/api/v1/beer/:beerId/review',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { beerId } = ctx.params
      const reviewListOrder =
        doValidateFilteredReviewListOrder(ctx.request.query)
      const reviews = await reviewService.listReviewsByBeer((
        beerId: string, reviewListOrder: ReviewListOrder
      ) => {
        return reviewRepository.listReviewsByBeer(
          ctx.db, beerId, reviewListOrder)
      }, beerId, reviewListOrder, ctx.log)

      ctx.body = {
        reviews,
        sorting: {
          order: reviewListOrder.property,
          direction: reviewListOrder.direction
        }
      }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId/review',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const reviewListOrder =
        doValidateFilteredReviewListOrder(ctx.request.query)
      const reviews = await reviewService.listReviewsByBrewery((
        breweryId: string, reviewListOrder: ReviewListOrder
      ) => (
        reviewRepository.listReviewsByBrewery(
          ctx.db, breweryId, reviewListOrder)
      ), breweryId, reviewListOrder, ctx.log)

      ctx.body = {
        reviews,
        sorting: {
          order: reviewListOrder.property,
          direction: reviewListOrder.direction
        }
      }
    }
  )

  router.get(
    '/api/v1/style/:styleId/review',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { styleId } = ctx.params
      const reviewListOrder =
        doValidateFilteredReviewListOrder(ctx.request.query)
      const reviews = await reviewService.listReviewsByStyle((
        styleId: string, reviewListOrder: ReviewListOrder
      ) => (
        reviewRepository.listReviewsByStyle(ctx.db, styleId, reviewListOrder)
      ), styleId, reviewListOrder, ctx.log)

      ctx.body = {
        reviews,
        sorting: {
          order: reviewListOrder.property,
          direction: reviewListOrder.direction
        }
      }
    }
  )

  router.get(
    '/api/v1/review',
    authHelper.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const reviewListOrder = doValidateFullReviewListOrder(ctx.request.query)
      const pagination = validatePagination({ skip, size })
      const reviews = await reviewService.listReviews((
        pagination: Pagination, reviewListOrder: ReviewListOrder
      ) => (
        reviewRepository.listReviews(ctx.db, pagination, reviewListOrder)
      ), pagination, reviewListOrder, ctx.log)
      ctx.body = {
        reviews,
        pagination,
        sorting: {
          order: reviewListOrder.property,
          direction: reviewListOrder.direction
        }
      }
    }
  )
}

function validateCreateRequest (body: unknown): CreateReviewRequest {
  if (!validateCreateReviewRequest(body)) {
    throw new ControllerError(400, 'InvalidReview', 'invalid review')
  }

  const result = body as CreateReviewRequest
  return result
}

function validateUpdateRequest (
  body: unknown,
  reviewId: string
): UpdateReviewRequest {
  if (!validateUpdateReviewRequest(body)) {
    throw new ControllerError(400, 'InvalidReview', 'invalid review')
  }
  if (typeof reviewId !== 'string' || reviewId.length === 0) {
    throw new ControllerError(400, 'InvalidReviewId', 'invalid review id')
  }

  const result = body as UpdateReviewRequest
  return result
}

function doValidateFullReviewListOrder (
  query: Record<string, unknown>
): ReviewListOrder {
  const reviewListOrder = validReviewListOrder(query, 'time', 'desc')
  const validated = validateReviewListOrder(reviewListOrder)

  if (validated.property === 'beer_name') {
    throw new ControllerError(
      400, 'InvalidReviewListQuery', 'invalid use of beer_name order')
  }
  if (validated.property === 'brewery_name') {
    throw new ControllerError(
      400, 'InvalidReviewListQuery', 'invalid use of brewery order')
  }
  return validated
}

function doValidateFilteredReviewListOrder (
  query: Record<string, unknown>
): ReviewListOrder {
  const reviewListOrder = validReviewListOrder(query, 'beer_name', 'asc')
  const validated = validateReviewListOrder(reviewListOrder)
  return validated
}

function validateReviewListOrder (
  reviewListOrder: ReviewListOrder | undefined
): ReviewListOrder {
  if (reviewListOrder === undefined) {
    throw new ControllerError(
      400, 'InvalidReviewListQuery', 'invalid review list query')
  }
  return reviewListOrder
}
