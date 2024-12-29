import * as userService from '../../core/user/authorized-user.service'

import {
  createAddPasswordUserIf,
} from './sign-in-method/sign-in-method-helper'

import {
  signInMethodController
} from './sign-in-method/sign-in-method.controller'

import * as authHelper from '../authentication/authentication-helper'

import * as refreshTokenRepository
from '../../data/authentication/refresh-token.repository'
import * as userRepository from '../../data/user/user.repository'

import type { Config } from '../config'

import type { Router } from '../router'
import type {
  CreateAnonymousUserRequest,
  CreateUserIf
} from '../../core/user/user'
import type { DbRefreshToken } from '../../core/auth/refresh-token'
import type { AuthTokenConfig } from '../../core/auth/auth-token'

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
          createAnonymousUser: async (
            request: CreateAnonymousUserRequest
          ) => await userRepository.createAnonymousUser(trx, request),
          insertRefreshToken: async (
            userId: string
          ): Promise<DbRefreshToken> =>
            await refreshTokenRepository.insertRefreshToken(
              trx,
              userId,
              new Date()
            ),
          addPasswordUserIf: createAddPasswordUserIf(trx)
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
      const userId: string | undefined = ctx.params.userId
      const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
      const user = await userService.findUserById(
        async (userId: string) => await userRepository.findUserById(
            ctx.db,
            userId
          ),
        findRefreshToken,
        {
          authTokenPayload,
          id: userId
        },
        ctx.log
      )

      ctx.body = { user }
    }
  )

  router.get(
    '/api/v1/user',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const users = await userService.listUsers(
        async () => await userRepository.listUsers(
          ctx.db
        ),
        authTokenPayload,
        ctx.log
      )

      ctx.body = { users }
    }
  )

  router.delete('/api/v1/user/:userId',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const userId: string | undefined = ctx.params.userId
      await ctx.db.executeTransaction(async (trx) => {
        await userService.deleteUserById(
          async (userId: string) => {
            await userRepository.deleteUserById(trx, userId);
          },
          {
            authTokenPayload,
            id: userId
          },
          ctx.log
        )
      })

      ctx.status = 204
    }
  )

  signInMethodController(router)
}
