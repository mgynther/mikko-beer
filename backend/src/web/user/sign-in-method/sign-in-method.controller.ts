import * as signInMethodService from '../../../core/user/sign-in-method.service'
import * as refreshTokenRepository from '../../../data/authentication/refresh-token.repository'
import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository'
import { config } from '../../config'
import * as authHelper from '../../authentication/authentication-helper'
import * as authTokenService from '../../../core/authentication/auth-token.service'
import * as userService from '../user.service'
import { type Transaction } from '../../../data/database'

import {
  RefreshTokenUserIdMismatchError
} from '../../../core/authentication/auth-token.service'
import {
  PasswordTooLongError,
  PasswordTooWeakError,
  SignInMethodNotFoundError,
  UserAlreadyHasSignInMethodError,
  WrongPasswordError,
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
import { ControllerError, UserNotFoundError } from '../../../core/errors'
import {
  type UserPasswordHash,
  validatePasswordChange,
  validatePasswordSignInMethod
} from '../../../core/user/sign-in-method'
import { type User } from '../../../core/user/user'

function handleError (error: unknown): void {
  if (
    error instanceof UserNotFoundError ||
    error instanceof WrongPasswordError ||
    error instanceof SignInMethodNotFoundError
  ) {
    // Don't leak too much information about why the sign in failed.
    throw new ControllerError(
      401,
      'InvalidCredentials',
      'wrong username or password'
    )
  }
  if (error instanceof RefreshTokenUserIdMismatchError) {
    // Don't leak too much information about why refresh failed.
    throw new ControllerError(
      401,
      'InvalidCredentials',
      'invalid token'
    )
  }
  if (error instanceof PasswordTooWeakError) {
    throw new ControllerError(
      400,
      'PasswordTooWeak',
      'password is too weak'
    )
  }
  if (error instanceof PasswordTooLongError) {
    throw new ControllerError(
      400,
      'PasswordTooLong',
      'password is too long'
    )
  }
  if (error instanceof UserAlreadyHasSignInMethodError) {
    throw new ControllerError(
      409,
      'UserAlreadyHasSignInMethod',
      'the user already has a sign in method'
    )
  }
}

export async function addPasswordSignInMethod (
  trx: Transaction,
  userId: string,
  request: unknown
): Promise<string> {
  if (!validatePasswordSignInMethod(request)) {
    throw new ControllerError(
      400,
      'InvalidSignInMethod',
      'invalid sign in method'
    )
  }

  try {
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
        return userService.setUserUsername(trx, userId, username)
      }
    }
    await signInMethodService.addPasswordSignInMethod(
      addPasswordUserIf,
      userId,
      request
    )
    return request.username
  } catch (error: unknown) {
    handleError(error)

    throw error
  }
}

export function signInMethodController (router: Router): void {
  router.post('/api/v1/user/sign-in', async (ctx) => {
    const { body } = ctx.request

    if (!validatePasswordSignInMethod(body)) {
      throw new ControllerError(
        400,
        'InvalidSignInMethod',
        'invalid sign in method'
      )
    }

    try {
      const signedInUser = await ctx.db.executeTransaction(async (trx) => {
        const signInUsingPasswordIf: SignInUsingPasswordIf = {
          lockUserByUsername: function(
            userName: string
          ): Promise<User | undefined> {
            return userService.lockUserByUsername(trx, userName)
          },
          findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
          createTokens: function(user: User): Promise<Tokens> {
            return authTokenService.createTokens((
              userId: string,
            ): Promise<DbRefreshToken> => {
              return refreshTokenRepository.insertRefreshToken(
                trx,
                userId,
                new Date()
              )
            }, user, config.authTokenSecret, config.authTokenExpiryDuration)
          },
        }
        return await signInMethodService.signInUsingPassword(
          signInUsingPasswordIf, body
        )
      })

      ctx.status = 200
      ctx.body = {
        user: signedInUser.user,
        authToken: signedInUser.authToken.authToken,
        refreshToken: signedInUser.refreshToken.refreshToken
      }
    } catch (error) {
      handleError(error)

      throw error
    }
  })

  router.post(
    '/api/v1/user/:userId/refresh',
    async (ctx) => {
      const { body } = ctx.request
      const userId = ctx.params.userId

      if (!validateRefreshToken(body)) {
        throw new ControllerError(
          400,
          'InvalidRefreshToken',
          'the body must contain a valid refresh token'
        )
      }

      try {
        const tokens = await ctx.db.executeTransaction(async (trx) => {
          const user = await userService.lockUserById(trx, userId)
          if (user === undefined) {
            throw new UserNotFoundError()
          }
          await authTokenService.deleteRefreshToken((
            refreshTokenId: string
          ) => {
            return refreshTokenRepository.deleteRefreshToken(
              ctx.db, refreshTokenId
            )
          }, user.id, body, config.authTokenSecret)
          const tokens = await authTokenService.createTokens((
            userId: string
          ) => {
            return refreshTokenRepository.insertRefreshToken(
              trx,
              userId,
              new Date()
            )
          }, user, config.authTokenSecret, config.authTokenExpiryDuration)
          return tokens
        })

        ctx.status = 200
        ctx.body = {
          authToken: tokens.auth.authToken,
          refreshToken: tokens.refresh.refreshToken
        }
      } catch (error) {
        handleError(error)

        throw error
      }
    }
  )

  router.post(
    '/api/v1/user/:userId/sign-out',
    authHelper.authenticateUser,
    async (ctx) => {
      const { body } = ctx.request

      if (!validateRefreshToken(body)) {
        throw new ControllerError(
          400,
          'InvalidRefreshToken',
          'the body must contain a valid refresh token'
        )
      }

      try {
        await authTokenService.deleteRefreshToken((
          refreshTokenId: string
        ) => {
          return refreshTokenRepository.deleteRefreshToken(
            ctx.db,
            refreshTokenId
          )
        }, ctx.params.userId, body, config.authTokenSecret)

        ctx.status = 200
        ctx.body = { success: true }
      } catch (error) {
        if (error instanceof RefreshTokenUserIdMismatchError) {
          throw new ControllerError(
            403,
            'RefreshTokenUserIdMismatch',
            "cannot delete another user's refresh token"
          )
        }

        throw error
      }
    }
  )

  router.post(
    '/api/v1/user/:userId/change-password',
    authHelper.authenticateUser,
    async (ctx) => {
      const { body } = ctx.request

      if (!validatePasswordChange(body)) {
        throw new ControllerError(
          400,
          'InvalidPasswordChange',
          'invalid password change'
        )
      }

      try {
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
            changePasswordUserIf, ctx.params.userId, body
          )
        })

        ctx.status = 204
      } catch (error: unknown) {
        handleError(error)
        throw error
      }
    }
  )
}

function createLockUserById(trx: Transaction) {
  return function(userId: string): Promise<any> {
    return userService.lockUserById(trx, userId)
  }
}

function createFindPasswordSignInMethod(trx: Transaction) {
  return function(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    return signInMethodRepository.findPasswordSignInMethod(trx, userId)
  }
}
