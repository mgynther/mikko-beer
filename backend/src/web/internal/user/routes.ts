import type {
  CreatedUserBody,
  ReadUserBody,
  UserHandlers,
  UserListBody,
} from '../../user/user.js'
import type { RouteRequest, Router } from '../router.js'

export function userRoutes(router: Router, user: UserHandlers): void {
  router.post(
    '/api/v1/user',
    201,
    async (request: RouteRequest): Promise<CreatedUserBody> =>
      await user.create({
        authorization: request.authorization,
        body: request.body,
      }),
  )

  router.get(
    '/api/v1/user/:userId',
    200,
    async (request: RouteRequest): Promise<ReadUserBody> =>
      await user.find({
        authorization: request.authorization,
        id: request.params.userId,
      }),
  )

  router.get(
    '/api/v1/user',
    200,
    async (request: RouteRequest): Promise<UserListBody> =>
      await user.list({ authorization: request.authorization }),
  )

  router.delete(
    '/api/v1/user/:userId',
    204,
    async (request: RouteRequest): Promise<undefined> => {
      await user.delete({
        authorization: request.authorization,
        id: request.params.userId,
      })
      return undefined
    },
  )
}
