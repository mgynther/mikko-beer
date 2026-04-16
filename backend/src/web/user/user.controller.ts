import * as userService from '../../core/user/authorized-user.service.js'

import { createAddPasswordUserIf } from './sign-in-method/sign-in-method-helper.js'

import { signInMethodController } from './sign-in-method/sign-in-method.controller.js'

import * as authHelper from '../authentication/authentication-helper.js'

import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository.js'
import * as userRepository from '../../data/user/user.repository.js'

import type { Config } from '../config.js'

import type { Router } from '../router.js'
import type {
  CreateAnonymousUserRequest,
  CreateUserIf,
} from '../../core/user/user.js'
import type { DbRefreshToken } from '../../core/auth/refresh-token.js'
import type { AuthTokenConfig } from '../../core/auth/auth-token.js'
import type { Context } from '../context.js'

export function userController(router: Router, config: Config): void {
  router.post('/api/v1/user', async (ctx: Context) => {
    const authTokenPayload = authHelper.parseAuthToken(ctx)
    const body: unknown = ctx.request.body

    const result = await ctx.db.executeReadWriteTransaction(async (trx) => {
      const authTokenConfig: AuthTokenConfig = {
        secret: config.authTokenSecret,
        expiryDurationMin: config.authTokenExpiryDurationMin,
      }
      const createUserIf: CreateUserIf = {
        createAnonymousUser: async (request: CreateAnonymousUserRequest) =>
          await userRepository.createAnonymousUser(trx, request),
        insertRefreshToken: async (userId: string): Promise<DbRefreshToken> =>
          await refreshTokenRepository.insertRefreshToken(
            trx,
            userId,
            new Date(),
          ),
        addPasswordUserIf: createAddPasswordUserIf(trx),
      }
      return await userService.createUser(
        createUserIf,
        authTokenPayload,
        body,
        authTokenConfig,
        ctx.log,
      )
    })

    return {
      status: 201,
      body: {
        user: result.user,
        authToken: result.authToken.authToken,
        refreshToken: result.refreshToken.refreshToken,
      },
    }
  })

  router.get('/api/v1/user/:userId', async (ctx: Context) => {
    const authTokenPayload = authHelper.parseAuthToken(ctx)
    const userId: string | undefined = ctx.params.userId
    const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
    const user = await userService.findUserById(
      async (userId: string) =>
        await userRepository.findUserById(ctx.db, userId),
      findRefreshToken,
      {
        authTokenPayload,
        id: userId,
      },
      ctx.log,
    )

    return {
      status: 200,
      body: { user },
    }
  })

  router.get('/api/v1/user', async (ctx: Context) => {
    const authTokenPayload = authHelper.parseAuthToken(ctx)
    const users = await userService.listUsers(
      async () => await userRepository.listUsers(ctx.db),
      authTokenPayload,
      ctx.log,
    )

    return {
      status: 200,
      body: { users },
    }
  })

  router.delete('/api/v1/user/:userId', async (ctx: Context) => {
    const authTokenPayload = authHelper.parseAuthToken(ctx)
    const userId: string | undefined = ctx.params.userId
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      await userService.deleteUserById(
        async (userId: string) => {
          await userRepository.deleteUserById(trx, userId)
        },
        {
          authTokenPayload,
          id: userId,
        },
        ctx.log,
      )
    })

    return {
      status: 204,
      body: undefined,
    }
  })

  signInMethodController(router)
}
