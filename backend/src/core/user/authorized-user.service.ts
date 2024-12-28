import * as authorizationService from '../auth/authorization.service'
import * as userService from './validated-user.service'

import type { IdRequest } from "../request"
import type { CreateUserIf, User } from "./user"

import type { log } from '../log'
import type {
  AuthTokenConfig,
  AuthTokenPayload
} from '../auth/auth-token'
import type { DbRefreshToken } from '../auth/refresh-token'
import type { SignedInUser } from './signed-in-user'

export async function createUser (
  createUserIf: CreateUserIf,
  authTokenPayload: AuthTokenPayload,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  authorizationService.authorizeAdmin(authTokenPayload)
  return await userService.createUser(createUserIf, body, authTokenConfig, log)
}

export async function findUserById (
  findUserById: (userId: string) => Promise<User | undefined>,
  findRefreshToken: (
    userId: string,
    refreshTokenId: string
  ) => Promise<DbRefreshToken | undefined>,
  request: IdRequest,
  log: log
): Promise<User> {
  await authorizationService.authorizeUser(
    request.id, request.authTokenPayload, findRefreshToken)
  return await userService.findUserById(
    findUserById,
    request.id,
    log
  )
}

export async function listUsers (
  listUsers: () => Promise<User[]>,
  authTokenPayload: AuthTokenPayload,
  log: log
): Promise<User[]> {
  authorizationService.authorizeViewer(authTokenPayload)
  return await userService.listUsers(listUsers, log)
}

export async function deleteUserById (
  deleteUserById: (id: string) => Promise<void>,
  request: IdRequest,
  log: log
): Promise<void> {
  authorizationService.authorizeAdmin(request.authTokenPayload)
  await userService.deleteUserById(
    deleteUserById,
    request.id,
    log
  )
}
