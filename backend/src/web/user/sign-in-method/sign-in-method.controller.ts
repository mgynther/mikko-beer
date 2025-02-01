import * as authorizedAuthTokenService
from '../../../core/auth/authorized-auth-token.service'
import * as signInMethodService
from '../../../core/user/authorized-sign-in-method.service'

import * as refreshTokenRepository
from '../../../data/authentication/refresh-token.repository'
import * as signInMethodRepository
from '../../../data/user/sign-in-method/sign-in-method.repository'
import * as userRepository from '../../../data/user/user.repository'
import * as authHelper from '../../authentication/authentication-helper'

import type { DbRefreshToken } from '../../../core/auth/refresh-token'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
  UserPasswordHash
} from '../../../core/user/sign-in-method'
import type { User } from '../../../core/user/user'
import type { AuthTokenConfig } from '../../../core/auth/auth-token'
import type {
  RefreshTokensIf
} from '../../../core/user/authorized-sign-in-method.service'
import type { Context } from '../../context'
import type { Transaction } from '../../../data/database'

import type { Router } from '../../router'

export function signInMethodController (router: Router): void {
  router.post('/api/v1/user/sign-in', async (ctx) => {
    const { body } = ctx.request

    const signedInUser = await ctx.db.executeTransaction(async (trx) => {
      const signInUsingPasswordIf: SignInUsingPasswordIf = {
        lockUserByUsername: async function(
          username: string
        ): Promise<User | undefined> {
          return await userRepository.lockUserByUsername(trx, username)
        },
        findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
        insertRefreshToken: async (
            userId: string,
        ): Promise<DbRefreshToken> =>
          await refreshTokenRepository.insertRefreshToken(
            trx,
            userId,
            new Date()
          )
      }
      return await signInMethodService.signInUsingPassword(
        signInUsingPasswordIf, body, getAuthTokenConfig(ctx)
      )
    })

    ctx.status = 200
    ctx.body = {
      user: signedInUser.user,
      authToken: signedInUser.authToken.authToken,
      refreshToken: signedInUser.refreshToken.refreshToken
    }
  })

  router.post(
    '/api/v1/user/:userId/refresh',
    async (ctx) => {
      const { body } = ctx.request
      const userId: string | undefined = ctx.params.userId

      const authTokenConfig: AuthTokenConfig = getAuthTokenConfig(ctx)

      const tokens = await ctx.db.executeTransaction(async (trx) => {
        const refreshTokensIf: RefreshTokensIf = {
          lockUserById: async (userId: string) =>
            await userRepository.lockUserById(trx, userId),
          deleteRefreshToken: async (refreshTokenId: string) => {
            await refreshTokenRepository.deleteRefreshToken(
              ctx.db, refreshTokenId
            );
          },
          insertRefreshToken: async (userId: string) =>
            await refreshTokenRepository.insertRefreshToken(
              trx,
              userId,
              new Date()
            )
        }
        return await signInMethodService.refreshTokens(
          refreshTokensIf,
          userId,
          body,
          authTokenConfig
        )
      })

      ctx.status = 200
      ctx.body = {
        authToken: tokens.auth.authToken,
        refreshToken: tokens.refresh.refreshToken
      }
    }
  )

  router.post(
    '/api/v1/user/:userId/sign-out',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request
      const userId: string | undefined = ctx.params.userId

      const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
      await authorizedAuthTokenService.deleteRefreshToken(
        findRefreshToken,
        async (
          refreshTokenId: string
        ) => {
          await refreshTokenRepository.deleteRefreshToken(
            ctx.db,
            refreshTokenId
          )
        },
        {
          authTokenPayload,
          id: userId
        },
        body,
        ctx.config.authTokenSecret
      )

      ctx.status = 200
      ctx.body = { success: true }
    }
  )

  router.post(
    '/api/v1/user/:userId/change-password',
    async (ctx) => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const { body } = ctx.request
      const userId: string | undefined = ctx.params.userId

      await ctx.db.executeTransaction(async (trx) => {
        const changePasswordUserIf: ChangePasswordUserIf = {
          lockUserById: async (userId: string) =>
            await userRepository.lockUserById(trx, userId),
          findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
          updatePassword: async function(
            userPasswordHash: UserPasswordHash
          ): Promise<void> {
            await signInMethodRepository.updatePassword(
              trx, userPasswordHash
            )
          }
        }
        const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
        await signInMethodService.changePassword(
          changePasswordUserIf, findRefreshToken, {
            authTokenPayload,
            id: userId
          }, body
        )
      })

      ctx.status = 204
    }
  )
}

function createFindPasswordSignInMethod(trx: Transaction) {
  return async function(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    return await signInMethodRepository.findPasswordSignInMethod(trx, userId)
  }
}

function getAuthTokenConfig(ctx: Context): AuthTokenConfig {
  return {
    secret: ctx.config.authTokenSecret,
    expiryDurationMin: ctx.config.authTokenExpiryDurationMin
  }
}
