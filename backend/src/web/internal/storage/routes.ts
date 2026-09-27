import type {
  AnnualStorageStatsBody,
  MonthlyStorageStatsBody,
  ReadStorageBody,
  StorageBody,
  StorageHandlers,
  StorageListBody,
  StoragesBody,
} from '../../storage/storage.js'
import type { RouteRequest, Router } from '../router.js'

export function storageRoutes(router: Router, storage: StorageHandlers): void {
  // Registered before /api/v1/storage/:storageId, which would otherwise take
  // their paths for a storage id.
  router.get(
    '/api/v1/storage/annual-stats',
    200,
    async (request: RouteRequest): Promise<AnnualStorageStatsBody> =>
      await storage.getAnnualStats({ authorization: request.authorization }),
  )

  router.get(
    '/api/v1/storage/monthly-stats',
    200,
    async (request: RouteRequest): Promise<MonthlyStorageStatsBody> =>
      await storage.getMonthlyStats({ authorization: request.authorization }),
  )

  router.post(
    '/api/v1/storage',
    201,
    async (request: RouteRequest): Promise<StorageBody> =>
      await storage.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.put(
    '/api/v1/storage/:storageId',
    200,
    async (request: RouteRequest): Promise<StorageBody> =>
      await storage.update({
        authorization: request.authorization,
        id: request.params.storageId,
        body: request.body,
      }),
  )

  router.delete(
    '/api/v1/storage/:storageId',
    204,
    async (request: RouteRequest): Promise<undefined> => {
      await storage.delete({
        authorization: request.authorization,
        id: request.params.storageId,
      })
      return undefined
    },
  )

  router.get(
    '/api/v1/storage/:storageId',
    200,
    async (request: RouteRequest): Promise<ReadStorageBody> =>
      await storage.find({
        authorization: request.authorization,
        id: request.params.storageId,
      }),
  )

  router.get(
    '/api/v1/beer/:beerId/storage',
    200,
    async (request: RouteRequest): Promise<StoragesBody> =>
      await storage.listByBeer({
        authorization: request.authorization,
        id: request.params.beerId,
      }),
  )

  router.get(
    '/api/v1/brewery/:breweryId/storage',
    200,
    async (request: RouteRequest): Promise<StoragesBody> =>
      await storage.listByBrewery({
        authorization: request.authorization,
        id: request.params.breweryId,
      }),
  )

  router.get(
    '/api/v1/style/:styleId/storage',
    200,
    async (request: RouteRequest): Promise<StoragesBody> =>
      await storage.listByStyle({
        authorization: request.authorization,
        id: request.params.styleId,
      }),
  )

  router.get(
    '/api/v1/storage',
    200,
    async (request: RouteRequest): Promise<StorageListBody> =>
      await storage.list({
        authorization: request.authorization,
        pagination: {
          size: request.query.size,
          skip: request.query.skip,
        },
      }),
  )
}
