import * as signInMethodService from '../../../core/user/sign-in-method.service'
import * as refreshTokenRepository from '../../../data/authentication/refresh-token.repository'
import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository'
import * as userRepository from '../../../data/user/user.repository'
import * as authHelper from '../../authentication/authentication-helper'
import * as authTokenService from '../../../core/authentication/auth-token.service'
import * as userService from '../../../core/user/user.service'
import { type Transaction } from '../../../data/database'

import {
  type AddPasswordUserIf,
  type ChangePasswordUserIf,
  type SignInUsingPasswordIf,
} from '../../../core/user/sign-in-method.service'
import { type Tokens } from '../../../core/authentication/tokens'
import {
  type DbRefreshToken,
  validateRefreshToken
} from '../../../core/authentication/refresh-token'
import { type Router } from '../../router'
import { log } from '../../../core/log'
import {
  type UserPasswordHash,
  validatePasswordChange,
  validatePasswordSignInMethod
} from '../../../core/user/sign-in-method'
import { type User } from '../../../core/user/user'
import { type AuthTokenConfig } from '../../../core/authentication/auth-token'
import { type Context } from '../../context'

export async function addPasswordSignInMethod (
  trx: Transaction,
  userId: string,
  request: unknown,
  log: log
): Promise<string> {
  const passwordSignInMethod = validatePasswordSignInMethod(request)

  const addPasswordUserIf: AddPasswordUserIf = {
    lockUserById: createLockUserById(trx),
    insertPasswordSignInMethod: function(
      userPassword: UserPasswordHash
    ): Promise<void> {
      return signInMethodRepository.insertPasswordSignInMethod(
        trx, userPassword
      ) as Promise<unknown> as Promise<void>
    },
    setUserUsername: function(
      userId: string, username: string
    ): Promise<void> {
      return userService.setUserUsername(
        (userId: string, username: string) => {
          return userRepository.setUserUsername(trx, userId, username)
      }, userId, username, log)
    }
  }
  await signInMethodService.addPasswordSignInMethod(
    addPasswordUserIf,
    userId,
    passwordSignInMethod
  )
  return passwordSignInMethod.username
}

export function signInMethodController (router: Router): void {
  router.post('/api/v1/user/sign-in', async (ctx) => {
    const { body } = ctx.request

    const passwordSignInMethod = validatePasswordSignInMethod(body)
    const signedInUser = await ctx.db.executeTransaction(async (trx) => {
      const signInUsingPasswordIf: SignInUsingPasswordIf = {
        lockUserByUsername: function(
          username: string
        ): Promise<User | undefined> {
          return userService.lockUserByUsername((username: string) => {
            return userRepository.lockUserByUsername(trx, username)
          }, username)
        },
        findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
        createTokens: function(user: User): Promise<Tokens> {
          const authTokenConfig: AuthTokenConfig = getAuthTokenConfig(ctx)
          return authTokenService.createTokens((
            userId: string,
          ): Promise<DbRefreshToken> => {
            return refreshTokenRepository.insertRefreshToken(
              trx,
              userId,
              new Date()
            )
          }, user, authTokenConfig)
        },
      }
      return await signInMethodService.signInUsingPassword(
        signInUsingPasswordIf, passwordSignInMethod
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
      const userId = ctx.params.userId

      const refreshToken = validateRefreshToken(body)
      const tokens = await ctx.db.executeTransaction(async (trx) => {
        const user = await userService.lockUserById((userId: string) => {
          return userRepository.lockUserById(trx, userId)
        }, userId)
        await authTokenService.deleteRefreshToken((
          refreshTokenId: string
        ) => {
          return refreshTokenRepository.deleteRefreshToken(
            ctx.db, refreshTokenId
          )
        }, user.id, refreshToken, ctx.config.authTokenSecret)
        const authTokenConfig: AuthTokenConfig = getAuthTokenConfig(ctx)
        const tokens = await authTokenService.createTokens((
          userId: string
        ) => {
          return refreshTokenRepository.insertRefreshToken(
            trx,
            userId,
            new Date()
          )
        }, user, authTokenConfig)
        return tokens
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
    authHelper.authenticateUser,
    async (ctx) => {
      const { body } = ctx.request

      const refreshToken = validateRefreshToken(body)
      await authTokenService.deleteRefreshToken((
        refreshTokenId: string
      ) => {
        return refreshTokenRepository.deleteRefreshToken(
          ctx.db,
          refreshTokenId
        )
      }, ctx.params.userId, refreshToken, ctx.config.authTokenSecret)

      ctx.status = 200
      ctx.body = { success: true }
    }
  )

  router.post(
    '/api/v1/user/:userId/change-password',
    authHelper.authenticateUser,
    async (ctx) => {
      const { body } = ctx.request

      const passwordChange = validatePasswordChange(body)
      await ctx.db.executeTransaction(async (trx) => {
        const changePasswordUserIf: ChangePasswordUserIf = {
          lockUserById: createLockUserById(trx),
          findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
          updatePassword: function(
            userPasswordHash: UserPasswordHash
          ): Promise<void> {
            return signInMethodRepository.updatePassword(
              trx, userPasswordHash
            ) as Promise<unknown> as Promise<void>
          }
        }
        await signInMethodService.changePassword(
          changePasswordUserIf, ctx.params.userId, passwordChange
        )
      })

      ctx.status = 204
    }
  )
}

function createLockUserById(trx: Transaction) {
  return function(userId: string): Promise<any> {
    return userService.lockUserById((userId: string) => {
      return userRepository.lockUserById(trx, userId)
    }, userId)
  }
}

function createFindPasswordSignInMethod(trx: Transaction) {
  return function(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    return signInMethodRepository.findPasswordSignInMethod(trx, userId)
  }
}

function getAuthTokenConfig(ctx: Context): AuthTokenConfig {
  return {
    secret: ctx.config.authTokenSecret,
    expiryDuration: ctx.config.authTokenExpiryDuration
  }
}
