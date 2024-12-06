import * as userService from '../../core/user/authorized-user.service'
import {
  addPasswordSignInMethod,
} from './sign-in-method/sign-in-method-helper'
import {
  signInMethodController
} from './sign-in-method/sign-in-method.controller'
import * as authHelper from '../authentication/authentication-helper'
import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository'
import * as userRepository from '../../data/user/user.repository'

import { type Config } from '../config'

import type { Router } from '../router'
import type { CreateAnonymousUserRequest } from '../../core/user/user'
import type { DbRefreshToken } from '../../core/authentication/refresh-token'
import type { AuthTokenConfig } from '../../core/authentication/auth-token'
import type { CreateUserIf } from '../../core/user/authorized-user.service'
import type { PasswordSignInMethod } from '../../core/user/sign-in-method'

export function userController (router: Router, config: Config): void {
  router.post('/api/v1/user',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request

      const result = await ctx.db.executeTransaction(async (trx) => {
        const authTokenConfig: AuthTokenConfig = {
          secret: config.authTokenSecret,
          expiryDuration: config.authTokenExpiryDuration
        }
        const createUserIf: CreateUserIf = {
          createAnonymousUser: (request: CreateAnonymousUserRequest) => {
            return userRepository.createAnonymousUser(trx, request)
          },
          insertRefreshToken: (userId: string): Promise<DbRefreshToken> => {
            return refreshTokenRepository.insertRefreshToken(
              trx,
              userId,
              new Date()
            )
          },
          addPasswordSignInMethod: async (
            userId: string,
            passwordSignInMethod: PasswordSignInMethod
          ) => {
            return await addPasswordSignInMethod(
              trx,
              userId,
              passwordSignInMethod,
              ctx.log
            )
          }
        }
        return await userService.createUser(
          createUserIf,
          authTokenPayload,
          body,
          authTokenConfig,
          ctx.log
        )
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
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { userId } = ctx.params
      const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
      const user = await userService.findUserById((userId: string) => {
        return userRepository.findUserById(ctx.db, userId)
      }, findRefreshToken, {
        authTokenPayload,
        id: userId
      }, ctx.log)

      ctx.body = { user }
    }
  )

  router.get(
    '/api/v1/user',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const users = await userService.listUsers(() => {
        return userRepository.listUsers(ctx.db)
      }, authTokenPayload, ctx.log)

      ctx.body = { users }
    }
  )

  router.delete('/api/v1/user/:userId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { userId } = ctx.params
      await ctx.db.executeTransaction(async (trx) => {
        await userService.deleteUserById((userId: string) => {
          return userRepository.deleteUserById(trx, userId)
        }, {
          authTokenPayload,
          id: userId
        }, ctx.log)
      })

      ctx.status = 204
    }
  )

  signInMethodController(router)
}
