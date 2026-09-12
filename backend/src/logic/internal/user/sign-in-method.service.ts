import * as authTokenService from '../../internal/auth/auth-token.service.js'
import * as userService from '../user/user.service.js'

import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError,
} from '../../errors.js'
import type { log } from '../../log.js'
import type { SignedInUser } from '../../user/signed-in-user.js'
import type {
  AddPasswordUserIf,
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
} from '../../user/sign-in-method.js'
import type { AuthTokenConfig } from '../../auth/auth-token.js'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 255

export async function addPasswordSignInMethod(
  addPasswordUserIf: AddPasswordUserIf,
  userId: string,
  method: PasswordSignInMethod,
  log: log,
): Promise<void> {
  const user = await userService.lockUserById(
    addPasswordUserIf.lockUserById,
    userId,
  )

  if (user.username?.length !== undefined && user.username.length > 0) {
    throw userAlreadyHasSignInMethodError
  }

  validatePassword(method.password)
  await addPasswordUserIf.insertPasswordSignInMethod({
    userId,
    passwordHash: await addPasswordUserIf.encryptSecret(log, method.password),
    hashedAt: new Date(),
  })

  await userService.setUserUsername(
    addPasswordUserIf.setUserUsername,
    userId,
    method.username,
    log,
  )
}

export async function changePassword(
  changePasswordUserIf: ChangePasswordUserIf,
  userId: string,
  change: PasswordChange,
  log: log,
): Promise<void> {
  const user = await userService.lockUserById(
    changePasswordUserIf.lockUserById,
    userId,
  )

  if (user.username === null || user.username.length === 0) {
    throw invalidCredentialsError
  }

  const signInMethod = await changePasswordUserIf.findPasswordSignInMethod(
    user.id,
  )

  if (signInMethod === undefined) {
    throw invalidCredentialsError
  }

  if (
    !(await changePasswordUserIf.verifySecret(
      log,
      change.oldPassword,
      signInMethod.passwordHash,
    ))
  ) {
    throw invalidCredentialsError
  }

  validatePassword(change.newPassword)
  await changePasswordUserIf.updatePassword({
    userId,
    passwordHash: await changePasswordUserIf.encryptSecret(
      log,
      change.newPassword,
    ),
    hashedAt: new Date(),
  })
}

export async function signInUsingPassword(
  signInUsingPasswordIf: SignInUsingPasswordIf,
  method: PasswordSignInMethod,
  authTokenConfig: AuthTokenConfig,
  log: log,
): Promise<SignedInUser> {
  const user = await userService.lockUserByUsername(
    signInUsingPasswordIf.lockUserByUsername,
    method.username,
  )
  const signInMethod = await signInUsingPasswordIf.findPasswordSignInMethod(
    user.id,
  )

  if (signInMethod === undefined) {
    throw invalidCredentialsError
  }

  const password = method.password
  if (
    !(await signInUsingPasswordIf.verifySecret(
      log,
      password,
      signInMethod.passwordHash,
    ))
  ) {
    throw invalidCredentialsError
  }

  if (signInMethod.hashedAt === undefined) {
    await signInUsingPasswordIf.updatePassword({
      userId: user.id,
      // Cannot apply any validation on the password as the rules may have
      // changed and login cannot fail permanently for this reason here.
      passwordHash: await signInUsingPasswordIf.encryptSecret(log, password),
      hashedAt: new Date(),
    })
  }

  const { refresh, auth } = await authTokenService.createTokens(
    signInUsingPasswordIf.insertRefreshToken,
    user,
    authTokenConfig,
  )

  return {
    user,
    authToken: auth,
    refreshToken: refresh,
  }
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw passwordTooWeakError
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw passwordTooLongError
  }
}
