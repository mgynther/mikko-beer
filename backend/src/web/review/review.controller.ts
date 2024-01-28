import * as reviewService from './review.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'
import {
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type ReviewListOrder,
  validateCreateReviewRequest,
  validateUpdateReviewRequest,
  validReviewListOrder
} from '../../core/review/review'
import { ControllerError } from '../errors'
import { validatePagination } from '../pagination'

export function reviewController (router: Router): void {
  router.post('/api/v1/review',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { storage } = ctx.request.query

      const createReviewRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        const storageParam = typeof storage === 'string' &&
          storage.length > 0
          ? storage
          : undefined
        return await reviewService.createReview(
          trx, createReviewRequest, storageParam
        )
      })

      ctx.status = 201
      ctx.body = {
        review: result
      }
    }
  )

  router.put('/api/v1/review/:reviewId',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request
      const { reviewId } = ctx.params

      const updateReviewRequest = validateUpdateRequest(body, reviewId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await reviewService.updateReview(
          trx, reviewId, updateReviewRequest)
      })

      ctx.status = 200
      ctx.body = {
        review: result
      }
    }
  )

  router.get(
    '/api/v1/review/:reviewId',
    authService.authenticateViewer,
    async (ctx) => {
      const { reviewId } = ctx.params
      const review = await reviewService.findReviewById(ctx.db, reviewId)

      if (review == null) {
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
    authService.authenticateViewer,
    async (ctx) => {
      const { beerId } = ctx.params
      const reviewResult =
        await reviewService.listReviewsByBeer(ctx.db, beerId)
      const reviews = reviewResult ?? []

      ctx.body = { reviews }
    }
  )

  router.get(
    '/api/v1/brewery/:breweryId/review',
    authService.authenticateViewer,
    async (ctx) => {
      const { breweryId } = ctx.params
      const reviewResult =
        await reviewService.listReviewsByBrewery(ctx.db, breweryId)
      const reviews = reviewResult ?? []

      ctx.body = { reviews }
    }
  )

  router.get(
    '/api/v1/review',
    authService.authenticateViewer,
    async (ctx) => {
      const { skip, size } = ctx.request.query
      const reviewListOrder = doValidateReviewListOrder(ctx.request.query)
      const pagination = validatePagination({ skip, size })
      const reviews =
        await reviewService.listReviews(ctx.db, pagination, reviewListOrder)
      ctx.body = { reviews, pagination }
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

function doValidateReviewListOrder (
  query: Record<string, unknown>
): ReviewListOrder {
  const reviewListOrder = validReviewListOrder(query)
  if (reviewListOrder === undefined) {
    throw new ControllerError(
      400, 'InvalidReviewListQuery', 'invalid review list query')
  }

  if (reviewListOrder.property === 'beer_name') {
    throw new ControllerError(
      400, 'InvalidReviewListQuery', 'invalid use of beer_name order')
  }
  return reviewListOrder
}
