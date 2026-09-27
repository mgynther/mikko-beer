import type {
  BeerBody,
  BeerHandlers,
  BeerListBody,
  BeerSearchBody,
  ReadBeerBody,
} from '../../beer/beer.js'
import type { RouteRequest, Router } from '../router.js'

export function beerRoutes(router: Router, beer: BeerHandlers): void {
  router.post(
    '/api/v1/beer',
    201,
    async (request: RouteRequest): Promise<BeerBody> =>
      await beer.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.put(
    '/api/v1/beer/:beerId',
    200,
    async (request: RouteRequest): Promise<BeerBody> =>
      await beer.update({
        authorization: request.authorization,
        id: request.params.beerId,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/beer/:beerId',
    200,
    async (request: RouteRequest): Promise<ReadBeerBody> =>
      await beer.find({
        authorization: request.authorization,
        id: request.params.beerId,
      }),
  )

  router.get(
    '/api/v1/beer',
    200,
    async (request: RouteRequest): Promise<BeerListBody> =>
      await beer.list({
        authorization: request.authorization,
        pagination: {
          size: request.query.size,
          skip: request.query.skip,
        },
      }),
  )

  router.post(
    '/api/v1/beer/search',
    200,
    async (request: RouteRequest): Promise<BeerSearchBody> =>
      await beer.search({
        authorization: request.authorization,
        body: request.body,
      }),
  )
}
