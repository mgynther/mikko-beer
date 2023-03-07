import * as reviewService from './review.service'
import * as authenticationService from '../authentication/authentication.service'

import { type Router } from '../router'
import { type CreateReviewRequest, type UpdateReviewRequest, validateCreateReviewRequest, validateUpdateReviewRequest } from './review'
import { ControllerError } from '../util/errors'

export function reviewController (router: Router): void {
  router.post('/api/v1/review',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request

      const createReviewRequest = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await reviewService.createReview(trx, createReviewRequest)
      })

      ctx.status = 201
      ctx.body = {
        review: result
      }
    }
  )

  router.put('/api/v1/review/:reviewId',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const { body } = ctx.request
      const { reviewId } = ctx.params

      const updateReviewRequest = validateUpdateRequest(body, reviewId)
      const result = await ctx.db.executeTransaction(async (trx) => {
        return await reviewService.updateReview(trx, reviewId, updateReviewRequest)
      })

      ctx.status = 200
      ctx.body = {
        review: result
      }
    }
  )

  router.get(
    '/api/v1/review/:reviewId',
    authenticationService.authenticateGeneric,
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
    '/api/v1/review',
    authenticationService.authenticateGeneric,
    async (ctx) => {
      const reviews = await reviewService.listReviews(ctx.db)
      ctx.body = { reviews }
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

function validateUpdateRequest (body: unknown, reviewId: string): UpdateReviewRequest {
  if (!validateUpdateReviewRequest(body)) {
    throw new ControllerError(400, 'InvalidReview', 'invalid review')
  }
  if (typeof reviewId !== 'string' || reviewId.length === 0) {
    throw new ControllerError(400, 'InvalidReviewId', 'invalid review id')
  }

  const result = body as UpdateReviewRequest
  return result
}
