import { parseRefreshTokenPayload } from '../../../logic/auth/authentication.js'
import * as authorizedAuthTokenService from '../../../logic/auth/authorized-auth-token.service.js'
import type { DeleteRefreshTokenIf } from '../../../logic/auth/authorized-auth-token.service.js'
import * as signInMethodService from '../../../logic/user/authorized-sign-in-method.service.js'
import type { RefreshTokensIf } from '../../../logic/user/authorized-sign-in-method.service.js'
import type {
  AuthTokenConfig,
  AuthTokenPayload,
} from '../../../logic/auth/auth-token.js'
import type {
  DbRefreshToken,
  RefreshTokenPayload,
} from '../../../logic/auth/refresh-token.js'
import type { Tokens } from '../../../logic/auth/tokens.js'
import type {
  ChangePasswordUserIf,
  SignInUsingPasswordIf,
  UserPasswordHash,
} from '../../../logic/user/sign-in-method.js'
import type { SignedInUser } from '../../../logic/user/signed-in-user.js'
import type { User } from '../../../logic/user/user.js'

import * as refreshTokenRepository from '../../../data/authentication/refresh-token.repository.js'
import type { Transaction } from '../../../data/database.js'
import * as signInMethodRepository from '../../../data/user/sign-in-method/sign-in-method.repository.js'
import * as userRepository from '../../../data/user/user.repository.js'

import { validateRefreshToken } from '../../../validation/auth.js'
import {
  validatePasswordChange,
  validatePasswordSignInMethod,
  validateUserId,
} from '../../../validation/user.js'

import type { IdBodyRequest } from '../../../web/request.js'
import type {
  RefreshRequest,
  SignInBody,
  SignInMethodHandlers,
  SignInRequest,
  SignOutBody,
  TokensBody,
} from '../../../web/user/sign-in-method.js'

import { authenticated } from '../../authentication/authenticated.js'
import { createFindRefreshTokenInTransaction } from '../../authentication/find-refresh-token.js'
import { jwtIf } from '../../authentication/jwt-helper.js'
import type { Config } from '../../config.js'
import type { Context } from '../../context.js'
import {
  createEncryptSecret,
  createNeedsRehash,
  createRejectSecret,
  createVerifySecret,
} from './sign-in-method-helper.js'

export function createSignInMethodHandlers(
  context: Context,
): SignInMethodHandlers {
  const { config, db, log } = context
  return {
    signIn: async (request: SignInRequest): Promise<SignInBody> => {
      const signedInUser = await db.executeReadWriteTransaction(
        async (trx: Transaction): Promise<SignedInUser> => {
          const signInUsingPasswordIf: SignInUsingPasswordIf = {
            lockUserByUsername: async (
              username: string,
            ): Promise<User | undefined> =>
              await userRepository.lockUserByUsername(trx, username),
            findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
            verifySecret: createVerifySecret(),
            rejectSecret: createRejectSecret(config.passwordHashParameters),
            needsRehash: createNeedsRehash(config.passwordHashParameters),
            encryptSecret: createEncryptSecret(config.passwordHashParameters),
            insertRefreshToken: createRefreshTokenInserter(trx),
            updatePassword: createPasswordUpdater(trx),
          }
          return await signInMethodService.signInUsingPassword(
            jwtIf,
            signInUsingPasswordIf,
            validatePasswordSignInMethod,
            request.body,
            authTokenConfig(config),
            log,
          )
        },
      )
      return {
        user: signedInUser.user,
        authToken: signedInUser.authToken.authToken,
        refreshToken: signedInUser.refreshToken.refreshToken,
      }
    },

    refresh: async (request: RefreshRequest): Promise<TokensBody> => {
      const refreshTokenPayload: RefreshTokenPayload = parseRefreshTokenPayload(
        jwtIf,
        validateRefreshToken,
        request.body,
        config.authTokenSecret,
      )
      const tokens = await db.executeReadWriteTransaction(
        async (trx: Transaction): Promise<Tokens> => {
          const refreshTokensIf: RefreshTokensIf = {
            lockUserById: async (userId: string): Promise<User | undefined> =>
              await userRepository.lockUserById(trx, userId),
            deleteRefreshToken: createRefreshTokenDeleter(trx),
            insertRefreshToken: createRefreshTokenInserter(trx),
          }
          return await signInMethodService.refreshTokens(
            jwtIf,
            refreshTokensIf,
            request.id,
            refreshTokenPayload,
            authTokenConfig(config),
          )
        },
      )
      return {
        authToken: tokens.auth.authToken,
        refreshToken: tokens.refresh.refreshToken,
      }
    },

    signOut: async (request: RefreshRequest): Promise<SignOutBody> => {
      const refreshTokenPayload: RefreshTokenPayload = parseRefreshTokenPayload(
        jwtIf,
        validateRefreshToken,
        request.body,
        config.authTokenSecret,
      )
      await db.executeReadWriteTransaction(
        async (trx: Transaction): Promise<void> => {
          const deleteRefreshTokenIf: DeleteRefreshTokenIf = {
            lockUserById: async (userId: string): Promise<User | undefined> =>
              await userRepository.lockUserById(trx, userId),
            deleteRefreshToken: createRefreshTokenDeleter(trx),
          }
          await authorizedAuthTokenService.deleteRefreshToken(
            deleteRefreshTokenIf,
            validateUserId,
            request.id,
            refreshTokenPayload,
          )
        },
      )
      return { success: true }
    },

    changePassword: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdBodyRequest,
      ): Promise<void> => {
        await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<void> => {
            const changePasswordUserIf: ChangePasswordUserIf = {
              lockUserById: async (userId: string): Promise<User | undefined> =>
                await userRepository.lockUserById(trx, userId),
              findPasswordSignInMethod: createFindPasswordSignInMethod(trx),
              verifySecret: createVerifySecret(),
              encryptSecret: createEncryptSecret(config.passwordHashParameters),
              updatePassword: createPasswordUpdater(trx),
            }
            await signInMethodService.changePassword(
              changePasswordUserIf,
              validatePasswordChange,
              validateUserId,
              createFindRefreshTokenInTransaction(trx),
              { authTokenPayload, id: request.id },
              request.body,
              log,
            )
          },
        )
      },
    ),
  }
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

function createRefreshTokenInserter(
  trx: Transaction,
): (userId: string) => Promise<DbRefreshToken> {
  return async (userId: string): Promise<DbRefreshToken> =>
    await refreshTokenRepository.insertRefreshToken(trx, userId, new Date())
}

function createRefreshTokenDeleter(
  trx: Transaction,
): (refreshTokenId: string) => Promise<boolean> {
  return async (refreshTokenId: string): Promise<boolean> =>
    await refreshTokenRepository.deleteRefreshToken(trx, refreshTokenId)
}

function createPasswordUpdater(
  trx: Transaction,
): (userPasswordHash: UserPasswordHash) => Promise<void> {
  return async (userPasswordHash: UserPasswordHash): Promise<void> => {
    await signInMethodRepository.updatePassword(trx, userPasswordHash)
  }
}

function authTokenConfig(config: Config): AuthTokenConfig {
  return {
    secret: config.authTokenSecret,
    expiryDurationMin: config.authTokenExpiryDurationMin,
  }
}
