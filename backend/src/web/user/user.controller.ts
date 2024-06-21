import * as userService from './user.service'
import {
  addPasswordSignInMethod,
  signInMethodController
} from './sign-in-method/sign-in-method.controller'
import * as authService from '../authentication/authentication.service'
import * as authHelper from '../authentication/authentication-helper'
import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository'

import { type Router } from '../router'
import {
  type Role,
  validateCreateAnonymousUserRequest
} from '../../core/user/user'
import {
  type PasswordSignInMethod,
  validatePasswordSignInMethod
} from '../../core/user/sign-in-method'
import { ControllerError } from '../../core/errors'
import { type DbRefreshToken } from '../../core/authentication/refresh-token'

export function userController (router: Router): void {
  router.post('/api/v1/user',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const request = validateCreateRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        const user = await userService.createAnonymousUser(
          trx,
          (userId: string): Promise<DbRefreshToken> => {
            return refreshTokenRepository.insertRefreshToken(trx, userId, new Date())
          },
          (refreshTokenId: string): Promise<void> => {
            return refreshTokenRepository.updateRefreshToken(trx, refreshTokenId, new Date())
          },
          request.role
        )
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

      if (user === undefined) {
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
    authHelper.authenticateViewer,
    async (ctx) => {
      const users = await userService.listUsers(ctx.db)

      ctx.body = { users }
    }
  )

  router.delete('/api/v1/user/:userId',
    authHelper.authenticateAdmin,
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
