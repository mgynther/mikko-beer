import * as signInMethodService from './sign-in-method.service'
import * as authService from '../../authentication/authentication.service'
import * as authTokenService from '../../authentication/auth-token.service'
import * as userService from '../user.service'
import { type Transaction } from '../../database'

import {
  RefreshTokenUserIdMismatchError
} from '../../authentication/auth-token.service'
import {
  PasswordTooLongError,
  PasswordTooWeakError,
  SignInMethodNotFoundError,
  UserAlreadyHasSignInMethodError,
  WrongPasswordError
} from './sign-in-method.service'
import { validateRefreshToken } from '../../authentication/refresh-token'
import { type Router } from '../../router'
import { ControllerError, UserNotFoundError } from '../../util/errors'
import {
  validatePasswordChange,
  validatePasswordSignInMethod
} from './sign-in-method'

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
    await signInMethodService.addPasswordSignInMethod(
      trx,
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
        return await signInMethodService.signInUsingPassword(trx, body)
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
          await authTokenService.deleteRefreshToken(ctx.db, user.id, body)
          const refreshToken =
            await authTokenService.createRefreshToken(trx, user.id)
          const authToken =
            await authTokenService.createAuthToken(trx, user.role, refreshToken)
          return {
            authToken,
            refreshToken
          }
        })

        ctx.status = 200
        ctx.body = {
          authToken: tokens.authToken.authToken,
          refreshToken: tokens.refreshToken.refreshToken
        }
      } catch (error) {
        handleError(error)

        throw error
      }
    }
  )

  router.post(
    '/api/v1/user/:userId/sign-out',
    authService.authenticateUser,
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
        await authTokenService.deleteRefreshToken(
          ctx.db,
          ctx.params.userId,
          body
        )

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
    authService.authenticateUser,
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
          await signInMethodService.changePassword(trx, ctx.params.userId, body)
        })

        ctx.status = 204
      } catch (error: unknown) {
        handleError(error)
        throw error
      }
    }
  )
}
