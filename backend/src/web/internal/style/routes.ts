import type {
  StyleBody,
  StyleHandlers,
  StyleListBody,
  ReadStyleBody,
} from '../../style/style.js'
import type { RouteRequest, Router } from '../router.js'

export function styleRoutes(router: Router, style: StyleHandlers): void {
  router.post(
    '/api/v1/style',
    201,
    async (request: RouteRequest): Promise<StyleBody> =>
      await style.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.put(
    '/api/v1/style/:styleId',
    200,
    async (request: RouteRequest): Promise<StyleBody> =>
      await style.update({
        authorization: request.authorization,
        id: request.params.styleId,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/style/:styleId',
    200,
    async (request: RouteRequest): Promise<ReadStyleBody> =>
      await style.find({
        authorization: request.authorization,
        id: request.params.styleId,
      }),
  )

  router.get(
    '/api/v1/style',
    200,
    async (request: RouteRequest): Promise<StyleListBody> =>
      await style.list({
        authorization: request.authorization,
      }),
  )
}
