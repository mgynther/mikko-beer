import type {
  SignInBody,
  SignInMethodHandlers,
  SignOutBody,
  TokensBody,
} from '../../user/sign-in-method.js'
import type { RouteRequest, Router } from '../router.js'

export function signInMethodRoutes(
  router: Router,
  signInMethod: SignInMethodHandlers,
): void {
  router.post(
    '/api/v1/user/sign-in',
    200,
    async (request: RouteRequest): Promise<SignInBody> =>
      await signInMethod.signIn({ body: request.body }),
  )

  router.post(
    '/api/v1/user/:userId/refresh',
    200,
    async (request: RouteRequest): Promise<TokensBody> =>
      await signInMethod.refresh({
        id: request.params.userId,
        body: request.body,
      }),
  )

  router.post(
    '/api/v1/user/:userId/sign-out',
    200,
    async (request: RouteRequest): Promise<SignOutBody> =>
      await signInMethod.signOut({
        authorization: request.authorization,
        id: request.params.userId,
        body: request.body,
      }),
  )

  router.post(
    '/api/v1/user/:userId/change-password',
    204,
    async (request: RouteRequest): Promise<undefined> => {
      await signInMethod.changePassword({
        authorization: request.authorization,
        id: request.params.userId,
        body: request.body,
      })
      return undefined
    },
  )
}
