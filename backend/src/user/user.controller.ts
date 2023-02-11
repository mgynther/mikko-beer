import * as userService from './user.service'
import * as authenticationService from '../authentication/authentication.service'

import { type Router } from '../router'
import { signInMethodController } from './sign-in-method/sign-in-method.controller'
import { type CreateAnonymousUserRequest, validateCreateAnonymousUserRequest } from './user'
import { ControllerError } from '../util/errors'

export function userController (router: Router): void {
  router.post('/api/v1/user', async (ctx) => {
    const { body } = ctx.request

    if (!validateCreateAnonymousUserRequest(body)) {
      throw new ControllerError(400, 'InvalidUser', 'invalid user')
    }

    const request: CreateAnonymousUserRequest = body as CreateAnonymousUserRequest
    const result = await ctx.db.transaction().execute(async (trx) => {
      return await userService.createAnonymousUser(trx, request)
    })

    ctx.status = 201
    ctx.body = {
      user: result.user,
      authToken: result.authToken.authToken,
      refreshToken: result.refreshToken.refreshToken
    }
  })

  router.get(
    '/api/v1/user/:userId',
    authenticationService.authenticateUser,
    async (ctx) => {
      const { userId } = ctx.params
      const user = await userService.findUserById(ctx.db, userId)

      if (user == null) {
        throw new ControllerError(
          404,
          'UserNotFound',
          `user with id ${userId} was not found`
        )
      }

      ctx.body = { user }
    }
  )

  signInMethodController(router)
}
