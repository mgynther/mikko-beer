import { describe, it } from 'node:test'
import {
  assertDeepEqual,
  assertEqual,
  assertGreaterThan,
  assertTruthy,
} from '../../../assert.js'

import * as authTokenService from '../../../../src/logic/internal/auth/auth-token.service.js'

import {
  addPasswordSignInMethod,
  changePassword,
  signInUsingPassword,
} from '../../../../src/logic/internal/user/sign-in-method.service.js'

import type {
  AddPasswordUserIf,
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  NewUserPasswordHash,
  UserPasswordHash,
} from '../../../../src/logic/user/sign-in-method.js'
import type { User } from '../../../../src/logic/user/user.js'
import type { ControllerError } from '../../../../src/logic/errors.js'
import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError,
} from '../../../../src/logic/errors.js'
import { expectReject } from '../../controller-error-helper.js'
import { dummyLog as log } from '../../dummy-log.js'
import type { AuthTokenConfig } from '../../../../src/logic/auth/auth-token.js'
import type { SignedInUser } from '../../../../src/logic/user/signed-in-user.js'
import { testJwtIf } from '../../jwt-helper.js'

function assertCurrentDateTime(date: Date) {
  if (date === undefined) {
    throw new Error('date is undefined')
  }
  const currentDate = new Date()
  // If any more precision is needed it would be better to inverse date access.
  // Without any time related logic in the implementation sanity checking the
  // dates is fine.
  assertGreaterThan(60 * 1000, Math.abs(currentDate.getTime() - date.getTime()))
}

describe('password sign-in-method service unit tests', () => {
  const userId = '3b3adde6-c6a2-45f1-bd5e-bce71b8d835f'
  const username = 'user'
  const user: User = {
    id: userId,
    role: 'admin',
    username: username,
  }

  const noPasswordUser: User = {
    id: userId,
    role: 'admin',
    username: null,
  }

  const knownPassword = 'password'

  const otherPassword = 'password1'

  const hashDate = new Date('2023-03-04T12:12:12.222Z')

  const encryptedSecret = 'encrypted'

  const method: PasswordSignInMethod = {
    username,
    password: knownPassword,
  }

  const passwordChange: PasswordChange = {
    oldPassword: method.password,
    newPassword: otherPassword,
  }

  const recentUserPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: encryptedSecret,
    hashedAt: hashDate,
  }

  const nonRecentUserPasswordHash: UserPasswordHash = {
    userId,
    passwordHash: encryptedSecret,
    hashedAt: undefined,
  }

  const authTokenConfig: AuthTokenConfig = {
    secret: 'this is a secret',
    expiryDurationMin: 5,
  }

  async function notCalled(): Promise<any> {
    throw new Error('not to be called')
  }

  async function lockValidUser(lockUserId: string): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return user
  }

  async function lockValidUserByUsername(
    lockUsername: string,
  ): Promise<User | undefined> {
    assertEqual(lockUsername, username)
    return user
  }

  async function lockNoPasswordUser(
    lockUserId: string,
  ): Promise<User | undefined> {
    assertEqual(lockUserId, userId)
    return noPasswordUser
  }

  async function lockMissingUser(): Promise<User | undefined> {
    return undefined
  }

  function getUserPasswordHasher(
    result: UserPasswordHash | undefined,
  ): (userId: string) => Promise<UserPasswordHash | undefined> {
    return async (userId: string) => {
      assertEqual(userId, user.id)
      return result
    }
  }

  const refreshTokenId = 'a8d69fd5-1491-4b63-86ea-6d5e3c7f624d'

  async function insertRefreshToken(userId: string) {
    assertEqual(userId, user.id)
    return {
      id: refreshTokenId,
      userId,
    }
  }

  // The token format belongs to the jwt layer. Here it matters that the
  // tokens were created and carry the signed in user.
  function expectTokensOf(signedInUser: SignedInUser) {
    assertTruthy(signedInUser.refreshToken.refreshToken)
    const authTokenPayload = authTokenService.verifyAuthToken(
      testJwtIf,
      signedInUser.authToken,
      authTokenConfig.secret,
    )
    assertDeepEqual(authTokenPayload, {
      userId: user.id,
      role: user.role,
      refreshTokenId,
    })
  }

  async function encryptSecret() {
    return encryptedSecret
  }

  async function passVerifySecret() {
    return true
  }

  async function failVerifySecret() {
    return false
  }

  interface PasswordValidationFailureCase {
    name: string
    password: string
    error: ControllerError
  }

  const passwordValidationFailureCases: PasswordValidationFailureCase[] = [
    {
      name: 'too short',
      password: 'passwor',
      error: passwordTooWeakError,
    },
    {
      name: 'too long',
      password: 'password'.repeat(100),
      error: passwordTooLongError,
    },
  ]

  it('add password sign-in-method', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      encryptSecret,
      insertPasswordSignInMethod: async function (
        userPassword: NewUserPasswordHash,
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        assertCurrentDateTime(userPassword.hashedAt)
        assertEqual(userPassword.passwordHash, encryptedSecret)
      },
      setUserUsername: async function (
        userId: string,
        username: string | null,
      ): Promise<void> {
        assertEqual(userId, user.id)
        assertEqual(username, user.username)
      },
    }
    await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
  })

  passwordValidationFailureCases.forEach((testCase) =>
    it(`fail to add password sign-in-method with invalid password ${
      testCase.name
    }`, async () => {
      const addPasswordUserIf: AddPasswordUserIf = {
        lockUserById: lockNoPasswordUser,
        encryptSecret: notCalled,
        insertPasswordSignInMethod: notCalled,
        setUserUsername: notCalled,
      }
      await expectReject(async () => {
        await addPasswordSignInMethod(
          addPasswordUserIf,
          userId,
          {
            ...method,
            password: testCase.password,
          },
          log,
        )
      }, testCase.error)
    }),
  )

  it('fail to add password sign-in-method for missing user', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockMissingUser,
      encryptSecret: notCalled,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    await expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, invalidCredentialsError)
  })

  it('fail to add password sign-in-method again', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockValidUser,
      encryptSecret: notCalled,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    await expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method, log)
    }, userAlreadyHasSignInMethodError)
  })

  it('change password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
      verifySecret: passVerifySecret,
      encryptSecret,
      updatePassword: async function (
        userPassword: NewUserPasswordHash,
      ): Promise<void> {
        assertEqual(userPassword.userId, user.id)
        assertCurrentDateTime(userPassword.hashedAt)
      },
    }
    await changePassword(changePasswordUserIf, userId, passwordChange, log)
  })

  passwordValidationFailureCases.forEach((testCase) =>
    it(`fail to change password with invalid password ${
      testCase.name
    }`, async () => {
      const changePasswordUserIf: ChangePasswordUserIf = {
        lockUserById: lockValidUser,
        findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
        verifySecret: passVerifySecret,
        encryptSecret: notCalled,
        updatePassword: notCalled,
      }
      await expectReject(async () => {
        await changePassword(
          changePasswordUserIf,
          userId,
          {
            ...passwordChange,
            newPassword: testCase.password,
          },
          log,
        )
      }, testCase.error)
    }),
  )

  it('fail to change password with null username', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: async () => {
        return {
          ...user,
          username: null,
        }
      },
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  it('fail to change password with empty username', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: async () => {
        return {
          ...user,
          username: '',
        }
      },
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  it('fail to change password without user', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  it('fail to change password without sign-in-method', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(undefined),
      verifySecret: notCalled,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  it('fail to change password with wrong old password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
      verifySecret: failVerifySecret,
      encryptSecret: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await changePassword(changePasswordUserIf, userId, passwordChange, log)
    }, invalidCredentialsError)
  })

  it('sign in using recently hashed password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
      verifySecret: passVerifySecret,
      encryptSecret: notCalled,
      insertRefreshToken,
      updatePassword: notCalled,
    }
    const result = await signInUsingPassword(
      testJwtIf,
      signInUsingPasswordIf,
      method,
      authTokenConfig,
      log,
    )
    assertDeepEqual(result.user, user)
    expectTokensOf(result)
  })

  it('sign in using non-recently hashed password', async () => {
    const userHashes: NewUserPasswordHash[] = []
    const updatePassword = async (userPasswordHash: NewUserPasswordHash) => {
      userHashes.push(userPasswordHash)
      return undefined
    }
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(
        nonRecentUserPasswordHash,
      ),
      verifySecret: passVerifySecret,
      encryptSecret,
      insertRefreshToken,
      updatePassword,
    }
    const result = await signInUsingPassword(
      testJwtIf,
      signInUsingPasswordIf,
      method,
      authTokenConfig,
      log,
    )
    assertDeepEqual(result.user, user)
    expectTokensOf(result)
    assertEqual(userHashes.length, 1)
    const newHash = userHashes[0]
    assertEqual(newHash.userId, user.id)
    assertEqual(newHash.passwordHash, encryptedSecret)
    assertCurrentDateTime(newHash.hashedAt)
  })

  it('fail to sign in using password without user', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      verifySecret: notCalled,
      encryptSecret: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await signInUsingPassword(
        testJwtIf,
        signInUsingPasswordIf,
        method,
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
  })

  it('fail to sign in using password without password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(undefined),
      verifySecret: notCalled,
      encryptSecret: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await signInUsingPassword(
        testJwtIf,
        signInUsingPasswordIf,
        method,
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
  })

  it('fail to sign in using password with wrong password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getUserPasswordHasher(recentUserPasswordHash),
      verifySecret: failVerifySecret,
      encryptSecret: notCalled,
      insertRefreshToken: notCalled,
      updatePassword: notCalled,
    }
    await expectReject(async () => {
      await signInUsingPassword(
        testJwtIf,
        signInUsingPasswordIf,
        method,
        authTokenConfig,
        log,
      )
    }, invalidCredentialsError)
  })
})
