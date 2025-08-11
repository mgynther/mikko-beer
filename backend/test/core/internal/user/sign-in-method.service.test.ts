import { describe, it } from 'node:test'
import {
  assertDeepEqual,
  assertEqual,
  assertGreaterThan
} from '../../../assert'

import * as authTokenService from '../../../../src/core/internal/auth/auth-token.service'

import {
  addPasswordSignInMethod,
  changePassword,
  encryptPassword,
  signInUsingPassword,
  verifySecret
} from '../../../../src/core/internal/user/sign-in-method.service'

import type {
  AddPasswordUserIf,
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  UserPasswordHash,
} from '../../../../src/core/user/sign-in-method'
import { User } from '../../../../src/core/user/user'
import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError
} from '../../../../src/core/errors'
import { expectReject } from '../../controller-error-helper'
import { dummyLog as log } from '../../dummy-log'
import { AuthTokenConfig } from '../../../../src/core/auth/auth-token'

describe('encrypt and verify password', () => {
  it('fail to encrypt too short password', async () => {
    expectReject(async () => {
      await encryptPassword('passwor')
    }, passwordTooWeakError)
  })

  it('fail to encrypt too long password', async () => {
    expectReject(async () => {
      await encryptPassword('password'.repeat(100))
    }, passwordTooLongError)
  })

  it('encrypt password and verify password', async () => {
    const password = 'password'
    const result = await encryptPassword(password)
    // Sanity check format without being specific.
    assertGreaterThan(result.length, 30)
    const [salt, hashedPassword] = result.split(':')
    assertGreaterThan(salt.length, 10)
    assertGreaterThan(hashedPassword.length, 20)
    // There's no trivial way ensure hash is correct without using the same
    // implementation as in the tested code.
    assertEqual(await verifySecret(password, result), true)
    // While ensuring correctness is hard, it's trivial to ensure wrong
    // password fails.
    assertEqual(await verifySecret(`${password}1`, result), false)
  })
})

describe('password sign-in-method service unit tests', () => {
  const userId = '3b3adde6-c6a2-45f1-bd5e-bce71b8d835f'
  const username = 'user'
  const user: User = {
    id: userId,
    role: 'admin',
    username: username
  }

  const noPasswordUser: User = {
    id: userId,
    role: 'admin',
    username: null,
  }

  const knownPassword = 'password'
  const knownHash = '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

  const otherPassword = 'password1'
  const otherHash = 'c4e457548452abcaf38f97cfce412926:8af0071d2da359277beea4a9c3232d898b975e9ed9170bdea77578667f753f08970144297a5cd9382acbcb9a5341f3e0e0026c1c7d877dcfbce2abd3f528bb9f'

  const method: PasswordSignInMethod = {
    username,
    password: knownPassword,
  }

  const passwordChange: PasswordChange = {
    oldPassword: method.password,
    newPassword: otherPassword,
  }

  const userPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: knownHash,
  }

  const authTokenConfig: AuthTokenConfig = {
    secret: 'this is a secret',
    expiryDurationMin: 5
  }

  async function notCalled(): Promise<any> {
    throw new Error('not to be called')
  }

  async function lockValidUser(
    lockUserId: string
  ): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return user
  }

  async function lockValidUserByUsername(
    lockUsername: string
  ): Promise<User | undefined> {
    assertEqual(lockUsername, username)
    return user
  }

  async function lockNoPasswordUser(
    lockUserId: string
  ): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return noPasswordUser
  }

  async function lockMissingUser(): Promise<User | undefined> {
    return undefined
  }

  async function getUserPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    assertEqual(userId, user.id)
    return userPasswordHash
  }

  async function getOtherPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    assertEqual(userId, user.id)
    return {
      userId,
      passwordHash: otherHash
    }
  }

  async function getMissingPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    assertEqual(userId, user.id)
    return undefined
  }

  async function insertRefreshToken(userId: string) {
    assertEqual(userId, user.id)
    return {
      id: 'a8d69fd5-1491-4b63-86ea-6d5e3c7f624d',
      userId
    }
  }

  it('add password sign-in-method', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      insertPasswordSignInMethod: async function(
        userPassword: UserPasswordHash
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        assertEqual(
          await verifySecret(method.password, userPassword.passwordHash),
          true
        )
      },
      setUserUsername: async function(
        userId: string, username: string | null
      ): Promise<void> {
        assertEqual(userId, user.id)
        assertEqual(username, user.username)
      }
    }
    await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
  })

  it('fail to add password sign-in-method for missing user', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockMissingUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, invalidCredentialsError)
  })

  it('fail to add password sign-in-method again', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockValidUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, userAlreadyHasSignInMethodError)
  })

  // Other error cases are unit tested separately but just to be sure an
  // invalid password cannot be added, let's test it on this level too.
  it('fail to add too short password', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    const method: PasswordSignInMethod = {
      username,
      password: 'passwor',
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, passwordTooWeakError)
  })

  it('change password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHash,
      updatePassword: async function(
        userPassword: UserPasswordHash
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        assertEqual(
          await verifySecret(
            passwordChange.newPassword, userPassword.passwordHash),
          true
        )
      },
    }
    await changePassword(changePasswordUserIf, userId, passwordChange)
  })

  it('fail to change password without user', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      updatePassword: notCalled,
    }
    expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange)
    }, invalidCredentialsError)
  })

  it('fail to change password without sign-in-method', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getMissingPasswordHash,
      updatePassword: notCalled,
    }
    expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange)
    }, invalidCredentialsError)
  })

  it('fail to change password with wrong old password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getOtherPasswordHash,
      updatePassword: notCalled,
    }
    expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange)
    }, invalidCredentialsError)
  })

  it('sign in using password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHash,
      insertRefreshToken
    }
    const result = await signInUsingPassword(
      signInUsingPasswordIf,
      method,
      authTokenConfig
    )
    assertDeepEqual(result.user, user)
    const reference = await authTokenService.createTokens(
      insertRefreshToken,
      user,
      authTokenConfig
    )
    assertDeepEqual(result.refreshToken, reference.refresh)
    assertDeepEqual(result.authToken, reference.auth)
  })

  it('fail to sign in using password without user', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      insertRefreshToken: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method, authTokenConfig)
    }, invalidCredentialsError)
  })

  it('fail to sign in using password without password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getMissingPasswordHash,
      insertRefreshToken: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method, authTokenConfig)
    }, invalidCredentialsError)
  })

  it('fail to sign in using password with wrong password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getOtherPasswordHash,
      insertRefreshToken: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method, authTokenConfig)
    }, invalidCredentialsError)
  })
})
