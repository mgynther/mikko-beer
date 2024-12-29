import * as reviewService from '../../core/review/authorized.service'

import * as beerRepository from '../../data/beer/beer.repository'
import * as containerRepository from '../../data/container/container.repository'
import * as reviewRepository from '../../data/review/review.repository'
import * as storageRepository from '../../data/storage/storage.repository'

import { parseAuthToken } from '../authentication/authentication-helper'

import type { Router } from '../router'
import type { Pagination } from '../../core/pagination'
import type {
  CreateIf,
  NewReview,
  Review,
  ReviewListOrder,
  UpdateIf
} from '../../core/review/review'
import {
  validateFilteredReviewListOrder,
  validateFullReviewListOrder
} from '../../core/review/review'
import { validatePagination } from '../../core/pagination'

export function reviewController (router: Router): void {
  router.post('/api/v1/review',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { body } = ctx.request
      const { storage } = ctx.request.query

      const storageParam = typeof storage === 'string' &&
        storage.length > 0
        ? storage
        : undefined
      const result = await ctx.db.executeTransaction(async (trx) => {
        const createIf: CreateIf = {
          createReview: async (
            review: NewReview
          ) => await reviewRepository.insertReview(trx, review),
          deleteFromStorage: async (
            storageId: string
          ) => { await storageRepository.deleteStorageById(
            trx, storageId); },
          lockBeer: async (id: string): Promise<string | undefined> =>
            await beerRepository.lockBeer(trx, id),
          lockContainer: async (id: string): Promise<string | undefined> =>
            await containerRepository.lockContainer(trx, id),
          lockStorage: async (id: string): Promise<string | undefined> =>
            await storageRepository.lockStorage(trx, id)
        }
        return await reviewService.createReview(
          createIf,
          {
            authTokenPayload,
            body
          },
          storageParam,
          ctx.log
        )
      })

      ctx.status = 201
      ctx.body = {
        review: result
      }
    }
  )

  router.put('/api/v1/review/:reviewId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { body } = ctx.request
      const reviewId: string | undefined = ctx.params.reviewId

      const result = await ctx.db.executeTransaction(async (trx) => {
        const updateIf: UpdateIf = {
          updateReview: async (
            review: Review
          ) => await reviewRepository.updateReview(trx, review),
          lockBeer: async (id: string): Promise<string | undefined> =>
            await beerRepository.lockBeer(trx, id),
          lockContainer: async (id: string): Promise<string | undefined> =>
            await containerRepository.lockContainer(trx, id)
        }
        return await reviewService.updateReview(
          updateIf,
          {
            authTokenPayload,
            id: reviewId
          },
          body,
          ctx.log
        )
      })

      ctx.status = 200
      ctx.body = {
        review: result
      }
    }
  )

  router.get(
    '/api/v1/review/:reviewId',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const reviewId: string | undefined = ctx.params.reviewId
      const review = await reviewService.findReviewById(
        async (reviewId: string) =>
          await reviewRepository.findReviewById(ctx.db, reviewId),
        {
          authTokenPayload,
          id: reviewId
        },
        ctx.log
      )

      ctx.body = { review }
    }
  )

  router.get(
    '/api/v1/beer/:beerId/review',
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const beerId: string | undefined = ctx.params.beerId
      const reviewListOrder =
        validateFilteredReviewListOrder(ctx.request.query)
      const reviews = await reviewService.listReviewsByBeer(async (
        beerId: string, reviewListOrder: ReviewListOrder
      ) => await reviewRepository.listReviewsByBeer(
          ctx.db, beerId, reviewListOrder), {
        authTokenPayload,
        id: beerId
      }, reviewListOrder, ctx.log)

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
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const breweryId: string | undefined = ctx.params.breweryId
      const reviewListOrder =
        validateFilteredReviewListOrder(ctx.request.query)
      const reviews = await reviewService.listReviewsByBrewery(async (
        breweryId: string, reviewListOrder: ReviewListOrder
      ) => (
        await reviewRepository.listReviewsByBrewery(
          ctx.db, breweryId, reviewListOrder)
      ), {
        authTokenPayload,
        id: breweryId
      }, reviewListOrder, ctx.log)

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
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const styleId: string | undefined = ctx.params.styleId
      const reviewListOrder =
        validateFilteredReviewListOrder(ctx.request.query)
      const reviews = await reviewService.listReviewsByStyle(async (
        styleId: string, reviewListOrder: ReviewListOrder
      ) => (
        await reviewRepository.listReviewsByStyle(
          ctx.db,
          styleId,
          reviewListOrder
        )
      ), {
        authTokenPayload,
        id: styleId
      }, reviewListOrder, ctx.log)

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
    async (ctx) => {
      const authTokenPayload = parseAuthToken(ctx)
      const { skip, size } = ctx.request.query
      const reviewListOrder = validateFullReviewListOrder(ctx.request.query)
      const pagination = validatePagination({ skip, size })
      const reviews = await reviewService.listReviews(async (
        pagination: Pagination, reviewListOrder: ReviewListOrder
      ) => (
        await reviewRepository.listReviews(ctx.db, pagination, reviewListOrder)
      ), authTokenPayload, pagination, reviewListOrder, ctx.log)
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
