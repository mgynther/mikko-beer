import type {
  BreweryBody,
  BreweryHandlers,
  BreweryListBody,
  BrewerySearchBody,
  ReadBreweryBody,
} from '../../brewery/brewery.js'
import type { RouteRequest, Router } from '../router.js'

export function breweryRoutes(router: Router, brewery: BreweryHandlers): void {
  router.post(
    '/api/v1/brewery',
    201,
    async (request: RouteRequest): Promise<BreweryBody> =>
      await brewery.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.put(
    '/api/v1/brewery/:breweryId',
    200,
    async (request: RouteRequest): Promise<BreweryBody> =>
      await brewery.update({
        authorization: request.authorization,
        id: request.params.breweryId,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/brewery/:breweryId',
    200,
    async (request: RouteRequest): Promise<ReadBreweryBody> =>
      await brewery.find({
        authorization: request.authorization,
        id: request.params.breweryId,
      }),
  )

  router.get(
    '/api/v1/brewery',
    200,
    async (request: RouteRequest): Promise<BreweryListBody> =>
      await brewery.list({
        authorization: request.authorization,
        pagination: {
          size: request.query.size,
          skip: request.query.skip,
        },
      }),
  )

  router.post(
    '/api/v1/brewery/search',
    200,
    async (request: RouteRequest): Promise<BrewerySearchBody> =>
      await brewery.search({
        authorization: request.authorization,
        body: request.body,
      }),
  )
}
