import * as reviewService from '../../core/review/authorized.service.js'

import * as beerRepository from '../../data/beer/beer.repository.js'
import * as containerRepository from '../../data/container/container.repository.js'
import * as reviewRepository from '../../data/review/review.repository.js'
import * as storageRepository from '../../data/storage/storage.repository.js'

import { parseAuthToken } from '../authentication/authentication-helper.js'

import type { Router } from '../router.js'
import type { Pagination } from '../../core/pagination.js'
import type {
  CreateIf,
  NewReview,
  Review,
  ReviewListRequest,
  UpdateIf,
} from '../../core/review/review.js'
import {
  validateFilteredReviewListOrder,
  validateFullReviewListOrder,
  validateReviewListFilter,
} from '../../core/review/review.js'
import { validatePagination } from '../../core/pagination.js'
import type { Context } from '../context.js'

export function reviewController(router: Router): void {
  router.post('/api/v1/review', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const body: unknown = ctx.request.body
    const { storage } = ctx.request.query

    const storageParam =
      typeof storage === 'string' && storage.length > 0 ? storage : undefined
    const result = await ctx.db.executeReadWriteTransaction(async (trx) => {
      const createIf: CreateIf = {
        createReview: async (review: NewReview) =>
          await reviewRepository.insertReview(trx, review),
        deleteFromStorage: async (storageId: string) => {
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
        {
          authTokenPayload,
          body,
        },
        storageParam,
        ctx.log,
      )
    })

    return {
      status: 201,
      body: {
        review: result,
      },
    }
  })

  router.put('/api/v1/review/:reviewId', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const body: unknown = ctx.request.body
    const reviewId: string | undefined = ctx.params.reviewId

    const result = await ctx.db.executeReadWriteTransaction(async (trx) => {
      const updateIf: UpdateIf = {
        updateReview: async (review: Review) =>
          await reviewRepository.updateReview(trx, review),
        lockBeer: async (id: string): Promise<string | undefined> =>
          await beerRepository.lockBeer(trx, id),
        lockContainer: async (id: string): Promise<string | undefined> =>
          await containerRepository.lockContainer(trx, id),
      }
      return await reviewService.updateReview(
        updateIf,
        {
          authTokenPayload,
          id: reviewId,
        },
        body,
        ctx.log,
      )
    })

    return {
      status: 200,
      body: {
        review: result,
      },
    }
  })

  router.get('/api/v1/review/:reviewId', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const reviewId: string | undefined = ctx.params.reviewId
    const review = await reviewService.findReviewById(
      async (reviewId: string) =>
        await reviewRepository.findReviewById(ctx.db, reviewId),
      {
        authTokenPayload,
        id: reviewId,
      },
      ctx.log,
    )

    return {
      status: 200,
      body: { review },
    }
  })

  router.get('/api/v1/beer/:beerId/review', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const beerId: string | undefined = ctx.params.beerId
    const reviewListRequest = parseFilteredReviewListRequest(ctx.request.query)
    const reviews = await reviewService.listReviewsByBeer(
      async (beerId: string, reviewListRequest: ReviewListRequest) =>
        await reviewRepository.listReviewsByBeer(
          ctx.db,
          beerId,
          reviewListRequest,
        ),
      {
        authTokenPayload,
        id: beerId,
      },
      reviewListRequest,
      ctx.log,
    )

    return {
      status: 200,
      body: {
        reviews,
        sorting: {
          order: reviewListRequest.order.property,
          direction: reviewListRequest.order.direction,
        },
      },
    }
  })

  router.get('/api/v1/brewery/:breweryId/review', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const breweryId: string | undefined = ctx.params.breweryId
    const reviewListRequest = parseFilteredReviewListRequest(ctx.request.query)
    const reviews = await reviewService.listReviewsByBrewery(
      async (breweryId: string, reviewListRequest: ReviewListRequest) =>
        await reviewRepository.listReviewsByBrewery(
          ctx.db,
          breweryId,
          reviewListRequest,
        ),
      {
        authTokenPayload,
        id: breweryId,
      },
      reviewListRequest,
      ctx.log,
    )

    return {
      status: 200,
      body: {
        reviews,
        sorting: {
          order: reviewListRequest.order.property,
          direction: reviewListRequest.order.direction,
        },
      },
    }
  })

  router.get('/api/v1/location/:locationId/review', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const locationId: string | undefined = ctx.params.locationId
    const reviewListRequest = parseFilteredReviewListRequest(ctx.request.query)
    const reviews = await reviewService.listReviewsByLocation(
      async (locationId: string, reviewListRequest: ReviewListRequest) =>
        await reviewRepository.listReviewsByLocation(
          ctx.db,
          locationId,
          reviewListRequest,
        ),
      {
        authTokenPayload,
        id: locationId,
      },
      reviewListRequest,
      ctx.log,
    )

    return {
      status: 200,
      body: {
        reviews,
        sorting: {
          order: reviewListRequest.order.property,
          direction: reviewListRequest.order.direction,
        },
      },
    }
  })

  router.get('/api/v1/style/:styleId/review', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const styleId: string | undefined = ctx.params.styleId
    const reviewListRequest = parseFilteredReviewListRequest(ctx.request.query)
    const reviews = await reviewService.listReviewsByStyle(
      async (styleId: string, reviewListRequest: ReviewListRequest) =>
        await reviewRepository.listReviewsByStyle(
          ctx.db,
          styleId,
          reviewListRequest,
        ),
      {
        authTokenPayload,
        id: styleId,
      },
      reviewListRequest,
      ctx.log,
    )

    return {
      status: 200,
      body: {
        reviews,
        sorting: {
          order: reviewListRequest.order.property,
          direction: reviewListRequest.order.direction,
        },
      },
    }
  })

  router.get('/api/v1/review', async (ctx: Context) => {
    const authTokenPayload = parseAuthToken(ctx)
    const { skip, size } = ctx.request.query
    const reviewListFilter = validateReviewListFilter(ctx.request.query)
    const reviewListOrder = validateFullReviewListOrder(ctx.request.query)
    const pagination = validatePagination({ skip, size })
    const reviews = await reviewService.listReviews(
      async (pagination: Pagination, reviewListRequest: ReviewListRequest) =>
        await reviewRepository.listReviews(
          ctx.db,
          pagination,
          reviewListRequest,
        ),
      authTokenPayload,
      pagination,
      {
        filter: reviewListFilter,
        order: reviewListOrder,
      },
      ctx.log,
    )
    return {
      status: 200,
      body: {
        reviews,
        pagination,
        sorting: {
          order: reviewListOrder.property,
          direction: reviewListOrder.direction,
        },
      },
    }
  })
}

function parseFilteredReviewListRequest(
  query: Record<string, unknown>,
): ReviewListRequest {
  const reviewListOrder = validateFilteredReviewListOrder(query)
  const reviewListFilter = validateReviewListFilter(query)
  return {
    filter: reviewListFilter,
    order: reviewListOrder,
  }
}
