import type {
  FilteredReviewListBody,
  ReadReviewBody,
  ReviewBody,
  ReviewHandlers,
  ReviewListBody,
  ReviewListQuery,
} from '../../review/review.js'
import type { RouteRequest, Router } from '../router.js'

export function reviewRoutes(router: Router, review: ReviewHandlers): void {
  router.post(
    '/api/v1/review',
    201,
    async (request: RouteRequest): Promise<ReviewBody> =>
      await review.create({
        authorization: request.authorization,
        body: request.body,
        storage: request.query.storage,
      }),
  )

  router.put(
    '/api/v1/review/:reviewId',
    200,
    async (request: RouteRequest): Promise<ReviewBody> =>
      await review.update({
        authorization: request.authorization,
        id: request.params.reviewId,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/review/:reviewId',
    200,
    async (request: RouteRequest): Promise<ReadReviewBody> =>
      await review.find({
        authorization: request.authorization,
        id: request.params.reviewId,
      }),
  )

  router.get(
    '/api/v1/beer/:beerId/review',
    200,
    async (request: RouteRequest): Promise<FilteredReviewListBody> =>
      await review.listByBeer({
        authorization: request.authorization,
        id: request.params.beerId,
        list: reviewListQuery(request),
      }),
  )

  router.get(
    '/api/v1/brewery/:breweryId/review',
    200,
    async (request: RouteRequest): Promise<FilteredReviewListBody> =>
      await review.listByBrewery({
        authorization: request.authorization,
        id: request.params.breweryId,
        list: reviewListQuery(request),
      }),
  )

  router.get(
    '/api/v1/location/:locationId/review',
    200,
    async (request: RouteRequest): Promise<FilteredReviewListBody> =>
      await review.listByLocation({
        authorization: request.authorization,
        id: request.params.locationId,
        list: reviewListQuery(request),
      }),
  )

  router.get(
    '/api/v1/style/:styleId/review',
    200,
    async (request: RouteRequest): Promise<FilteredReviewListBody> =>
      await review.listByStyle({
        authorization: request.authorization,
        id: request.params.styleId,
        list: reviewListQuery(request),
      }),
  )

  router.get(
    '/api/v1/review',
    200,
    async (request: RouteRequest): Promise<ReviewListBody> =>
      await review.list({
        authorization: request.authorization,
        pagination: {
          size: request.query.size,
          skip: request.query.skip,
        },
        list: reviewListQuery(request),
      }),
  )
}

function reviewListQuery(request: RouteRequest): ReviewListQuery {
  return {
    order: request.query.order,
    direction: request.query.direction,
    minRating: request.query.min_rating,
    maxRating: request.query.max_rating,
    minTime: request.query.min_time,
    maxTime: request.query.max_time,
  }
}
