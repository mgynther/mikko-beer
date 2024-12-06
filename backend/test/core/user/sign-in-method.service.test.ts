import { expect } from 'earl'

import {
  type AddPasswordUserIf,
  addPasswordSignInMethod,
  changePassword,
  encryptPassword,
  signInUsingPassword,
  verifySecret
} from '../../../src/core/user/sign-in-method.service'

import { type Tokens } from '../../../src/core/authentication/tokens'
import type {
  ChangePasswordUserIf,
  PasswordChange,
  PasswordSignInMethod,
  SignInUsingPasswordIf,
  UserPasswordHash,
} from '../../../src/core/user/sign-in-method'
import { Role, User } from '../../../src/core/user/user'
import {
  invalidCredentialsError,
  passwordTooLongError,
  passwordTooWeakError,
  userAlreadyHasSignInMethodError
} from '../../../src/core/errors'
import { expectReject } from '../controller-error-helper'

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
    expect(result.length).toBeGreaterThan(30)
    const [salt, hashedPassword] = result.split(':')
    expect(salt.length).toBeGreaterThan(10)
    expect(hashedPassword.length).toBeGreaterThan(20)
    // There's no trivial way ensure hash is correct without using the same
    // implementation as in the tested code.
    expect(await verifySecret(password, result)).toEqual(true)
    // While ensuring correctness is hard, it's trivial to ensure wrong
    // password fails.
    expect(await verifySecret(`${password}1`, result)).toEqual(false)
  })
})

describe('password sign-in-method service unit tests', () => {
  const userId = '3b3adde6-c6a2-45f1-bd5e-bce71b8d835f'
  const username = 'user'
  const user: User = {
    id: userId,
    role: Role.admin,
    username: username
  }

  const noPasswordUser: User = {
    id: userId,
    role: Role.admin,
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

  const dummyTokens: Tokens = {
    refresh: {
      refreshToken: 'dummy'
    },
    auth: {
      authToken: 'dummy'
    }
  }

  async function notCalled(): Promise<any> {
    throw new Error('not to be called')
  }

  async function lockValidUser(
    lockUserId: string
  ): Promise<User | undefined> {
    expect(lockUserId).toEqual(userId)
    return user
  }

  async function lockValidUserByUsername(
    lockUsername: string
  ): Promise<User | undefined> {
    expect(lockUsername).toEqual(username)
    return user
  }

  async function lockNoPasswordUser(
    lockUserId: string
  ): Promise<User | undefined> {
    expect(lockUserId).toEqual(userId)
    return noPasswordUser
  }

  async function lockMissingUser(): Promise<User | undefined> {
    return undefined
  }

  async function getUserPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    expect(userId).toEqual(user.id)
    return userPasswordHash
  }

  async function getOtherPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    expect(userId).toEqual(user.id)
    return {
      userId,
      passwordHash: otherHash
    }
  }

  async function getMissingPasswordHash(
    userId: string
  ): Promise<UserPasswordHash | undefined> {
    expect(userId).toEqual(user.id)
    return undefined
  }

  async function createDummyTokens(
    dummyUser: User
  ): Promise<Tokens> {
    expect(dummyUser).toEqual(user)
    return dummyTokens
  }

  it('add password sign-in-method', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockNoPasswordUser,
      insertPasswordSignInMethod: async function(
        userPassword: UserPasswordHash
      ): Promise<void> {
        expect(userPassword.userId).toEqual(user.id)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        expect(
          await verifySecret(method.password, userPassword.passwordHash)
        ).toEqual(true)
      },
      setUserUsername: async function(
        userId: string, username: string | null
      ): Promise<void> {
        expect(userId).toEqual(user.id)
        expect(username).toEqual(user.username)
      }
    }
    await addPasswordSignInMethod(addPasswordUserIf, userId, method)
  })

  it('fail to add password sign-in-method for missing user', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockMissingUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method)
    }, invalidCredentialsError)
  })

  it('fail to add password sign-in-method again', async () => {
    const addPasswordUserIf: AddPasswordUserIf = {
      lockUserById: lockValidUser,
      insertPasswordSignInMethod: notCalled,
      setUserUsername: notCalled,
    }
    expectReject(async () => {
      await addPasswordSignInMethod(addPasswordUserIf, userId, method)
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
      await addPasswordSignInMethod(addPasswordUserIf, userId, method)
    }, passwordTooWeakError)
  })

  it('change password', async () => {
    const changePasswordUserIf: ChangePasswordUserIf = {
      lockUserById: lockValidUser,
      findPasswordSignInMethod: getUserPasswordHash,
      updatePassword: async function(
        userPassword: UserPasswordHash
      ): Promise<void> {
        expect(userPassword.userId).toEqual(user.id)
        // There's no trivial way ensure hash is correct without using the same
        // implementation as in the tested code.
        expect(
          await verifySecret(
            passwordChange.newPassword, userPassword.passwordHash
          )
        ).toEqual(true)
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
      createTokens: createDummyTokens,
    }
    const result = await signInUsingPassword(signInUsingPasswordIf, method)
    expect(result.user).toEqual(user)
    expect(result.refreshToken).toEqual(dummyTokens.refresh)
    expect(result.authToken).toEqual(dummyTokens.auth)
  })

  it('fail to sign in using password without user', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockMissingUser,
      findPasswordSignInMethod: notCalled,
      createTokens: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method)
    }, invalidCredentialsError)
  })

  it('fail to sign in using password without password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getMissingPasswordHash,
      createTokens: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method)
    }, invalidCredentialsError)
  })

  it('fail to sign in using password with wrong password', async () => {
    const signInUsingPasswordIf: SignInUsingPasswordIf = {
      lockUserByUsername: lockValidUserByUsername,
      findPasswordSignInMethod: getOtherPasswordHash,
      createTokens: notCalled
    }
    expectReject(async () => {
      await signInUsingPassword(signInUsingPasswordIf, method)
    }, invalidCredentialsError)
  })
})
