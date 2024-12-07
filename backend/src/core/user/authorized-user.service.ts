import * as authorizationService from '../../core/auth/authorization.service'
import * as userService from '../../core/user/user.service'

import type { IdRequest } from "../request"
import type { CreateAnonymousUserRequest, User } from "./user"
import { validateCreateUserRequest, validateUserId } from "./user"

import type { log } from '../log'
import type {
  AuthTokenConfig,
  AuthTokenPayload
} from '../auth/auth-token'
import type { DbRefreshToken } from '../auth/refresh-token'
import type { PasswordSignInMethod } from './sign-in-method'
import type { SignedInUser } from './signed-in-user'

export interface CreateUserIf {
  createAnonymousUser: (request: CreateAnonymousUserRequest) => Promise<User>,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  addPasswordSignInMethod: (
    userId: string,
    passwordSignInMethod: PasswordSignInMethod
  ) => Promise<string>,
}

export async function createUser (
  createUserIf: CreateUserIf,
  authTokenPayload: AuthTokenPayload,
  body: unknown,
  authTokenConfig: AuthTokenConfig,
  log: log
): Promise<SignedInUser> {
  authorizationService.authorizeAdmin(authTokenPayload)
  const request = validateCreateUserRequest(body)
  const user = await userService.createAnonymousUser(
    createUserIf.createAnonymousUser,
    createUserIf.insertRefreshToken,
    request.role,
    authTokenConfig,
    log
  )
  const username = await createUserIf.addPasswordSignInMethod(
    user.user.id,
    request.passwordSignInMethod,
  )
  return {
    ...user,
    user: { ...user.user, username }
  }
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
    validateUserId(request.id),
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
    validateUserId(request.id),
    log
  )
}
