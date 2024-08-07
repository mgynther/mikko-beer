import * as userService from '../../core/user/user.service'
import {
  addPasswordSignInMethod,
  signInMethodController
} from './sign-in-method/sign-in-method.controller'
import * as authHelper from '../authentication/authentication-helper'
import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository'
import * as userRepository from '../../data/user/user.repository'

import { type Config } from '../config'

import { type Router } from '../router'
import {
  type CreateAnonymousUserRequest,
  validateCreateUserRequest
} from '../../core/user/user'
import { type DbRefreshToken } from '../../core/authentication/refresh-token'
import { type AuthTokenConfig } from '../../core/authentication/auth-token'

export function userController (router: Router, config: Config): void {
  router.post('/api/v1/user',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { body } = ctx.request

      const request = validateCreateUserRequest(body)
      const result = await ctx.db.executeTransaction(async (trx) => {
        const authTokenConfig: AuthTokenConfig = {
          secret: config.authTokenSecret,
          expiryDuration: config.authTokenExpiryDuration
        }
        const user = await userService.createAnonymousUser(
          (request: CreateAnonymousUserRequest) => {
            return userRepository.createAnonymousUser(trx, request)
          },
          (userId: string): Promise<DbRefreshToken> => {
            return refreshTokenRepository.insertRefreshToken(trx, userId, new Date())
          },
          request.role, authTokenConfig, ctx.log
        )
        const username = await addPasswordSignInMethod(
          trx,
          user.user.id,
          request.passwordSignInMethod,
          ctx.log
        )
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
    authHelper.authenticateUser,
    async (ctx) => {
      const { userId } = ctx.params
      const user = await userService.findUserById((userId: string) => {
        return userRepository.findUserById(ctx.db, userId)
      }, userId, ctx.log)

      ctx.body = { user }
    }
  )

  router.get(
    '/api/v1/user',
    authHelper.authenticateViewer,
    async (ctx) => {
      const users = await userService.listUsers(() => {
        return userRepository.listUsers(ctx.db)
      }, ctx.log)

      ctx.body = { users }
    }
  )

  router.delete('/api/v1/user/:userId',
    authHelper.authenticateAdmin,
    async (ctx) => {
      const { userId } = ctx.params
      await ctx.db.executeTransaction(async (trx) => {
        await userService.deleteUserById((userId: string) => {
          return userRepository.deleteUserById(trx, userId)
        }, userId, ctx.log)
      })

      ctx.status = 204
    }
  )

  signInMethodController(router)
}
