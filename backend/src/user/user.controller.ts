import * as userService from './user.service'
import {
  addPasswordSignInMethod,
  signInMethodController
} from './sign-in-method/sign-in-method.controller'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'
import { type Role, validateCreateAnonymousUserRequest } from './user'
import {
  type PasswordSignInMethod,
  validatePasswordSignInMethod
} from './sign-in-method/sign-in-method'
import { ControllerError } from '../util/errors'

export function userController (router: Router): void {
  router.post('/api/v1/user',
    authService.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const request = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        const user = await userService.createAnonymousUser(trx, request.role)
        const username = await addPasswordSignInMethod(
          trx, user.user.id, request.passwordSignInMethod)
        return {
          ...user,
          user: { ...user.user, username }
        }
      })

      ctx.status = 201
      ctx.body = {
        user: result.user,
        authToken: result.authToken.authToken,
        refreshToken: result.refreshToken.refreshToken
      }
    }
  )

  router.get(
    '/api/v1/user/:userId',
    authService.authenticateUser,
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

  router.get(
    '/api/v1/user',
    authService.authenticateViewer,
    async (ctx) => {
      const users = await userService.listUsers(ctx.db)

      ctx.body = { users }
    }
  )

  router.delete('/api/v1/user/:userId',
    authService.authenticateAdmin,
    async (ctx) => {
      const { userId } = ctx.params
      await ctx.db.executeTransaction(async (trx) => {
        await userService.deleteUserById(trx, userId)
      })

      ctx.status = 204
    }
  )

  signInMethodController(router)
}

interface ValidCreateRequest {
  role: Role
  passwordSignInMethod: PasswordSignInMethod
}

function validateCreateRequest (body: unknown): ValidCreateRequest {
  const anyBody: any = body
  if (!validateCreateAnonymousUserRequest(anyBody.user)) {
    throw new ControllerError(400, 'InvalidUser', 'invalid user')
  }
  if (!validatePasswordSignInMethod(anyBody.passwordSignInMethod)) {
    throw new ControllerError(400, 'InvalidUser', 'invalid sign in method')
  }

  const role: Role = anyBody.user.role as Role
  const passwordSignInMethod: PasswordSignInMethod =
    anyBody.passwordSignInMethod as PasswordSignInMethod
  return {
    role,
    passwordSignInMethod
  }
}
