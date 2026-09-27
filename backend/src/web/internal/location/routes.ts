import type {
  LocationBody,
  LocationHandlers,
  LocationListBody,
  LocationSearchBody,
  ReadLocationBody,
} from '../../location/location.js'
import type { RouteRequest, Router } from '../router.js'

export function locationRoutes(
  router: Router,
  location: LocationHandlers,
): void {
  router.post(
    '/api/v1/location',
    201,
    async (request: RouteRequest): Promise<LocationBody> =>
      await location.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.put(
    '/api/v1/location/:locationId',
    200,
    async (request: RouteRequest): Promise<LocationBody> =>
      await location.update({
        authorization: request.authorization,
        id: request.params.locationId,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/location/:locationId',
    200,
    async (request: RouteRequest): Promise<ReadLocationBody> =>
      await location.find({
        authorization: request.authorization,
        id: request.params.locationId,
      }),
  )

  router.get(
    '/api/v1/location',
    200,
    async (request: RouteRequest): Promise<LocationListBody> =>
      await location.list({
        authorization: request.authorization,
        pagination: {
          size: request.query.size,
          skip: request.query.skip,
        },
      }),
  )

  router.post(
    '/api/v1/location/search',
    200,
    async (request: RouteRequest): Promise<LocationSearchBody> =>
      await location.search({
        authorization: request.authorization,
        body: request.body,
      }),
  )
}
