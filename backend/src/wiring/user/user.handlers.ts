import * as userService from '../../logic/user/authorized-user.service.js'
import type {
  AuthTokenConfig,
  AuthTokenPayload,
} from '../../logic/auth/auth-token.js'
import type { DbRefreshToken } from '../../logic/auth/refresh-token.js'
import type { SignedInUser } from '../../logic/user/signed-in-user.js'
import type {
  CreateAnonymousUserRequest,
  CreateUserIf,
  User,
} from '../../logic/user/user.js'

import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository.js'
import type { Transaction } from '../../data/database.js'
import * as userRepository from '../../data/user/user.repository.js'

import {
  validateCreateUserRequest,
  validateUserId,
} from '../../validation/user.js'

import type { BodyRequest, IdRequest } from '../../web/request.js'
import type {
  CreatedUserBody,
  ReadUserBody,
  UserHandlers,
  UserListBody,
} from '../../web/user/user.js'

import { authenticated } from '../authentication/authenticated.js'
import { createFindRefreshToken } from '../authentication/find-refresh-token.js'
import { jwtIf } from '../authentication/jwt-helper.js'
import type { Context } from '../context.js'
import { createAddPasswordUserIf } from './sign-in-method/sign-in-method-helper.js'

export function createUserHandlers(context: Context): UserHandlers {
  const { config, db, log } = context
  return {
    create: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: BodyRequest,
      ): Promise<CreatedUserBody> => {
        const signedInUser = await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<SignedInUser> => {
            const authTokenConfig: AuthTokenConfig = {
              secret: config.authTokenSecret,
              expiryDurationMin: config.authTokenExpiryDurationMin,
            }
            const createUserIf: CreateUserIf = {
              createAnonymousUser: async (
                createRequest: CreateAnonymousUserRequest,
              ): Promise<User> =>
                await userRepository.createAnonymousUser(trx, createRequest),
              insertRefreshToken: async (
                userId: string,
              ): Promise<DbRefreshToken> =>
                await refreshTokenRepository.insertRefreshToken(
                  trx,
                  userId,
                  new Date(),
                ),
              addPasswordUserIf: createAddPasswordUserIf(
                trx,
                config.passwordHashParameters,
              ),
            }
            return await userService.createUser(
              jwtIf,
              createUserIf,
              validateCreateUserRequest,
              authTokenPayload,
              request.body,
              authTokenConfig,
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
    ),

    find: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<ReadUserBody> => {
        const user = await userService.findUserById(
          async (userId: string): Promise<User | undefined> =>
            await userRepository.findUserById(db, userId),
          validateUserId,
          createFindRefreshToken(db),
          { authTokenPayload, id: request.id },
          log,
        )
        return { user }
      },
    ),

    list: authenticated(
      config,
      async (authTokenPayload: AuthTokenPayload): Promise<UserListBody> => {
        const users = await userService.listUsers(
          async (): Promise<User[]> => await userRepository.listUsers(db),
          authTokenPayload,
          log,
        )
        return { users }
      },
    ),

    delete: authenticated(
      config,
      async (
        authTokenPayload: AuthTokenPayload,
        request: IdRequest,
      ): Promise<void> => {
        await db.executeReadWriteTransaction(
          async (trx: Transaction): Promise<void> => {
            await userService.deleteUserById(
              async (userId: string): Promise<void> => {
                await userRepository.deleteUserById(trx, userId)
              },
              validateUserId,
              { authTokenPayload, id: request.id },
              log,
            )
          },
        )
      },
    ),
  }
}
