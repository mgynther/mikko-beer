import * as crypto from 'crypto'

import { UserNotFoundError } from '../errors'
import { type Tokens } from '../authentication/tokens'
import { type User } from '../user/user'
import { type SignedInUser } from '../user/signed-in-user'
import {
  type PasswordChange,
  type PasswordSignInMethod,
  type UserPasswordHash
} from './sign-in-method'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255

export class UserAlreadyHasSignInMethodError extends Error {}
export class SignInMethodNotFoundError extends Error {}
export class WrongPasswordError extends Error {}
export class PasswordTooWeakError extends Error {}
export class PasswordTooLongError extends Error {}

type LockUserById = (userId: string) => Promise<User | undefined>

export interface AddPasswordUserIf {
  lockUserById: LockUserById
  insertPasswordSignInMethod: (userPassword: UserPasswordHash) => Promise<void>
  setUserUsername: (userId: string, username: string) => Promise<void>
}

export async function addPasswordSignInMethod (
  addPasswordUserIf: AddPasswordUserIf,
  userId: string,
  method: PasswordSignInMethod
): Promise<void> {
  const user = await lockUser(addPasswordUserIf.lockUserById, userId)

  if (user.username?.length !== undefined && user.username?.length > 0) {
    throw new UserAlreadyHasSignInMethodError()
  }

  await addPasswordUserIf.insertPasswordSignInMethod({
    userId,
    passwordHash: await encryptPassword(method.password)
  })

  await addPasswordUserIf.setUserUsername(userId, method.username)
}

export interface ChangePasswordUserIf {
  lockUserById: LockUserById
  findPasswordSignInMethod: (
    userId: string
  ) => Promise<UserPasswordHash | undefined>
  updatePassword: (userPasswordHash: UserPasswordHash) => Promise<void>
}

export async function changePassword (
  changePasswordUserIf: ChangePasswordUserIf,
  userId: string,
  change: PasswordChange
): Promise<void> {
  const user = await lockUser(changePasswordUserIf.lockUserById, userId)

  if (user.username === undefined || user.username?.length === 0) {
    throw new SignInMethodNotFoundError()
  }

  const signInMethod = await changePasswordUserIf.findPasswordSignInMethod(
    user.id
  )

  if (signInMethod === undefined) {
    throw new SignInMethodNotFoundError()
  }

  if (!(await verifyPassword(change.oldPassword, signInMethod.passwordHash))) {
    throw new WrongPasswordError()
  }

  await changePasswordUserIf.updatePassword({
    userId,
    passwordHash: await encryptPassword(change.newPassword)
  })
}

export interface SignInUsingPasswordIf {
  lockUserByUsername: (userName: string) => Promise<User | undefined>
  findPasswordSignInMethod: (
    userId: string
  ) => Promise<UserPasswordHash | undefined>
  createTokens: (user: User) => Promise<Tokens>
}

export async function signInUsingPassword (
  signInUsingPasswordIf: SignInUsingPasswordIf,
  method: PasswordSignInMethod
): Promise<SignedInUser> {
  const user = await signInUsingPasswordIf.lockUserByUsername(method.username)

  if (user === undefined) {
    throw new UserNotFoundError()
  }

  const signInMethod = await signInUsingPasswordIf.findPasswordSignInMethod(
    user.id
  )

  if (signInMethod === undefined) {
    throw new SignInMethodNotFoundError()
  }

  if (!(await verifyPassword(method.password, signInMethod.passwordHash))) {
    throw new WrongPasswordError()
  }

  const { refresh, auth } =
    await signInUsingPasswordIf.createTokens(user)

  return {
    user,
    authToken: auth,
    refreshToken: refresh
  }
}

export async function encryptPassword (password: string): Promise<string> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new PasswordTooWeakError()
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new PasswordTooLongError()
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

async function lockUser (
  lockUserById: LockUserById,
  userId: string
): Promise<User> {
  const user = await lockUserById(userId)

  if (user === undefined) {
    throw new UserNotFoundError()
  }
  return user
}
