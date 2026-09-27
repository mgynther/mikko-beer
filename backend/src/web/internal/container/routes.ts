import type {
  ContainerBody,
  ContainerHandlers,
  ContainerListBody,
  ReadContainerBody,
} from '../../container/container.js'
import type { RouteRequest, Router } from '../router.js'

export function containerRoutes(
  router: Router,
  container: ContainerHandlers,
): void {
  router.post(
    '/api/v1/container',
    201,
    async (request: RouteRequest): Promise<ContainerBody> =>
      await container.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.put(
    '/api/v1/container/:containerId',
    200,
    async (request: RouteRequest): Promise<ContainerBody> =>
      await container.update({
        authorization: request.authorization,
        id: request.params.containerId,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/container/:containerId',
    200,
    async (request: RouteRequest): Promise<ReadContainerBody> =>
      await container.find({
        authorization: request.authorization,
        id: request.params.containerId,
      }),
  )

  router.get(
    '/api/v1/container',
    200,
    async (request: RouteRequest): Promise<ContainerListBody> =>
      await container.list({
        authorization: request.authorization,
      }),
  )
}
