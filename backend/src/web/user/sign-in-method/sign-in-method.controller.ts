import * as authorizedAuthTokenService from '../../../core/auth/authorized-auth-token.service.js'
import * as signInMethodService from '../../../core/user/authorized-sign-in-method.service.js'

import * as refreshTokenRepository from '../../../data/authentication/refresh-token.repository.js'
import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository.js'
import * as userRepository from '../../../data/user/user.repository.js'
import * as authHelper from '../../authentication/authentication-helper.js'

import type { DbRefreshToken } from '../../../core/auth/refresh-token.js'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
  UserPasswordHash,
} from '../../../core/user/sign-in-method.js'
import type { SignedInUser } from '../../../core/user/signed-in-user.js'
import type { Tokens } from '../../../core/auth/tokens.js'
import type { User } from '../../../core/user/user.js'
import type { AuthTokenConfig } from '../../../core/auth/auth-token.js'
import type { RefreshTokensIf } from '../../../core/user/authorized-sign-in-method.service.js'
import type { Context } from '../../context.js'
import type { Transaction } from '../../../data/database.js'

import type { Router } from '../../router.js'

export interface SignInResponseUser {
  id: string
  role: 'admin' | 'viewer'
  username: string | null
}

interface SignInResult {
  status: 200
  body: {
    user: SignInResponseUser
    authToken: string
    refreshToken: string
  }
}

interface RefreshResult {
  status: 200
  body: {
    authToken: string
    refreshToken: string
  }
}

interface SignOutResult {
  status: 200
  body: {
    success: boolean
  }
}

interface ChangePasswordResult {
  status: 204
  body: undefined
}

export function signInMethodController(router: Router): void {
  router.post(
    '/api/v1/user/sign-in',
    async (ctx: Context): Promise<SignInResult> => {
      const body: unknown = ctx.request.body

      const signedInUser = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<SignedInUser> => {
          const signInUsingPasswordIf: SignInUsingPasswordIf = {
            lockUserByUsername: async function (
              username: string,
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
                new Date(),
              ),
            updatePassword: async function (
              userPasswordHash: UserPasswordHash,
            ): Promise<void> {
              await signInMethodRepository.updatePassword(trx, userPasswordHash)
            },
          }
          return await signInMethodService.signInUsingPassword(
            signInUsingPasswordIf,
            body,
            getAuthTokenConfig(ctx),
            ctx.log,
          )
        },
      )

      return {
        status: 200,
        body: {
          user: signedInUser.user,
          authToken: signedInUser.authToken.authToken,
          refreshToken: signedInUser.refreshToken.refreshToken,
        },
      }
    },
  )

  router.post(
    '/api/v1/user/:userId/refresh',
    async (ctx: Context): Promise<RefreshResult> => {
      const body: unknown = ctx.request.body
      const userId: string | undefined = ctx.params.userId

      const authTokenConfig: AuthTokenConfig = getAuthTokenConfig(ctx)

      const tokens = await ctx.db.executeReadWriteTransaction(
        async (trx): Promise<Tokens> => {
          const refreshTokensIf: RefreshTokensIf = {
            lockUserById: async (userId: string): Promise<User | undefined> =>
              await userRepository.lockUserById(trx, userId),
            deleteRefreshToken: async (
              refreshTokenId: string,
            ): Promise<void> => {
              await refreshTokenRepository.deleteRefreshToken(
                ctx.db,
                refreshTokenId,
              )
            },
            insertRefreshToken: async (
              userId: string,
            ): Promise<DbRefreshToken> =>
              await refreshTokenRepository.insertRefreshToken(
                trx,
                userId,
                new Date(),
              ),
          }
          return await signInMethodService.refreshTokens(
            refreshTokensIf,
            userId,
            body,
            authTokenConfig,
          )
        },
      )

      return {
        status: 200,
        body: {
          authToken: tokens.auth.authToken,
          refreshToken: tokens.refresh.refreshToken,
        },
      }
    },
  )

  router.post(
    '/api/v1/user/:userId/sign-out',
    async (ctx: Context): Promise<SignOutResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const userId: string | undefined = ctx.params.userId

      const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
      await authorizedAuthTokenService.deleteRefreshToken(
        findRefreshToken,
        async (refreshTokenId: string): Promise<void> => {
          await refreshTokenRepository.deleteRefreshToken(
            ctx.db,
            refreshTokenId,
          )
        },
        {
          authTokenPayload,
          id: userId,
        },
        body,
        ctx.config.authTokenSecret,
      )

      return {
        status: 200,
        body: { success: true },
      }
    },
  )

  router.post(
    '/api/v1/user/:userId/change-password',
    async (ctx: Context): Promise<ChangePasswordResult> => {
      const authTokenPayload = authHelper.parseAuthToken(ctx)
      const body: unknown = ctx.request.body
      const userId: string | undefined = ctx.params.userId

      await ctx.db.executeReadWriteTransaction(async (trx): Promise<void> => {
        const changePasswordUserIf: ChangePasswordUserIf = {
          lockUserById: async (userId: string): Promise<User | undefined> =>
            await userRepository.lockUserById(trx, userId),
          findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
          updatePassword: async function (
            userPasswordHash: UserPasswordHash,
          ): Promise<void> {
            await signInMethodRepository.updatePassword(trx, userPasswordHash)
          },
        }
        const findRefreshToken = authHelper.createFindRefreshToken(ctx.db)
        await signInMethodService.changePassword(
          changePasswordUserIf,
          findRefreshToken,
          {
            authTokenPayload,
            id: userId,
          },
          body,
          ctx.log,
        )
      })

      return {
        status: 204,
        body: undefined,
      }
    },
  )
}

function createFindPasswordSignInMethod(
  trx: Transaction,
): (userId: string) => Promise<UserPasswordHash | undefined> {
  return async function (
    userId: string,
  ): Promise<UserPasswordHash | undefined> {
    return await signInMethodRepository.findPasswordSignInMethod(trx, userId)
  }
}

function getAuthTokenConfig(ctx: Context): AuthTokenConfig {
  return {
    secret: ctx.config.authTokenSecret,
    expiryDurationMin: ctx.config.authTokenExpiryDurationMin,
  }
}
