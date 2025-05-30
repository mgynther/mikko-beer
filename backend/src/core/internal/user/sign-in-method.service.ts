import * as crypto from 'crypto'

import * as authTokenService from '../../internal/auth/auth-token.service'
import * as userService from '../user/user.service'

import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError
} from '../../errors'
import type { log } from '../../log'
import type { SignedInUser } from '../user/signed-in-user'
import type {
  AddPasswordUserIf,
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf
} from '../../user/sign-in-method'
import type { AuthTokenConfig } from '../../auth/auth-token'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255

export async function addPasswordSignInMethod (
  addPasswordUserIf: AddPasswordUserIf,
  userId: string,
  method: PasswordSignInMethod,
  log: log
): Promise<void> {
  const user = await userService.lockUserById(
    addPasswordUserIf.lockUserById,
    userId
  )

  if (user.username?.length !== undefined && user.username.length > 0) {
    throw userAlreadyHasSignInMethodError
  }

  await addPasswordUserIf.insertPasswordSignInMethod({
    userId,
    passwordHash: await encryptPassword(method.password)
  })

  await userService.setUserUsername(
    addPasswordUserIf.setUserUsername,
    userId,
    method.username,
    log
  )
}

export async function changePassword (
  changePasswordUserIf: ChangePasswordUserIf,
  userId: string,
  change: PasswordChange
): Promise<void> {
  const user = await userService.lockUserById(
    changePasswordUserIf.lockUserById,
    userId
  )

  if (user.username === null || user.username.length === 0) {
    throw invalidCredentialsError
  }

  const signInMethod = await changePasswordUserIf.findPasswordSignInMethod(
    user.id
  )

  if (signInMethod === undefined) {
    throw invalidCredentialsError
  }

  if (!(await verifyPassword(change.oldPassword, signInMethod.passwordHash))) {
    throw invalidCredentialsError
  }

  await changePasswordUserIf.updatePassword({
    userId,
    passwordHash: await encryptPassword(change.newPassword)
  })
}

export async function signInUsingPassword (
  signInUsingPasswordIf: SignInUsingPasswordIf,
  method: PasswordSignInMethod,
  authTokenConfig: AuthTokenConfig
): Promise<SignedInUser> {
  const user = await userService.lockUserByUsername(
    signInUsingPasswordIf.lockUserByUsername, method.username);
  const signInMethod = await signInUsingPasswordIf.findPasswordSignInMethod(
    user.id
  )

  if (signInMethod === undefined) {
    throw invalidCredentialsError
  }

  if (!(await verifyPassword(method.password, signInMethod.passwordHash))) {
    throw invalidCredentialsError
  }

  const { refresh, auth } = await authTokenService.createTokens(
    signInUsingPasswordIf.insertRefreshToken,
    user,
    authTokenConfig
  )

  return {
    user,
    authToken: auth,
    refreshToken: refresh
  }
}

export async function encryptPassword (password: string): Promise<string> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw passwordTooWeakError
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw passwordTooLongError
  }

  return await encryptSecret(password)
}

async function encryptSecret (secret: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${await scrypt(secret, salt)}`
}

export async function verifySecret (
  secret: string, hash: string
): Promise<boolean> {
  const [salt, secretHash] = hash.split(':')
  return (await scrypt(secret, salt)) === secretHash
}

async function scrypt (secret: string, salt: string): Promise<string> {
  /* eslint-disable-next-line promise/avoid-new --
   * Promisefying would be tedious and it could easily hide errors.
   */
  return await new Promise((resolve, reject) => {
    crypto.scrypt(
      secret,
      salt,
      64,
      { N: 16384, r: 8, p: 1 },
      (err, secretHash) => {
        if (err != null) {
          reject(err); return
        }

        resolve(secretHash.toString('hex'))
      }
    )
  })
}

async function verifyPassword (
  password: string,
  hash: string
): Promise<boolean> {
  return await verifySecret(password, hash)
}
