import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import type { Login } from './internal/login/reducer'
import {
  useChangePassword,
  useLogin,
  useLogout,
  usePasswordChangeResult,
  useSaveLogin,
  useStoredLogin,
} from './login'

// See store/beer.test.tsx for what the store layer's tests are for. The
// session the store keeps is tested here too: it is what the refresh handling
// changes behind the caller's back.
let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

const signedIn = {
  authToken: 'authtoken1',
  refreshToken: 'refreshtoken1',
  user: {
    id: 'dcdafbc9-3fe6-485f-9821-05bd4a8b7eb3',
    username: 'user1',
    role: 'admin',
  },
}

interface LoginProps {
  username: string
  onResponse: (isSuccess: boolean, data: unknown) => void
}

function LoginHelper(props: LoginProps): React.JSX.Element {
  const { login, isLoading } = useLogin()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          void (async (): Promise<void> => {
            const response = await login({
              username: props.username,
              password: 'password1',
            })
            props.onResponse(response.isSuccess, response.data)
          })()
        }}
      >
        Login
      </button>
    </div>
  )
}

test('login', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/user/sign-in',
    response: signedIn,
    status: 200,
  })

  const onResponse = vitest.fn()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <LoginHelper username='user1' onResponse={onResponse} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    expect(onResponse).toHaveBeenCalledWith(true, signedIn)
  })
  await waitFor(() => {
    expect(getByText('Not loading')).toBeDefined()
  })
})

test('failed login is an answer rather than a rejection', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/user/sign-in',
    response: { error: 'InvalidCredentials' },
    status: 401,
  })

  const onResponse = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <LoginHelper username='user2' onResponse={onResponse} />
    </StoreProvider>,
  )

  // Wrong credentials are what the user asked about, not a failure to reach
  // the backend, so the caller is told rather than thrown at.
  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    expect(onResponse).toHaveBeenCalledWith(false, undefined)
  })
})

function SessionHelper(props: { login: Login }): React.JSX.Element {
  const save = useSaveLogin()
  const stored = useStoredLogin()
  return (
    <div>
      <button
        type='button'
        onClick={() => {
          save(props.login)
        }}
      >
        Save
      </button>
      <div>{JSON.stringify(stored)}</div>
    </div>
  )
}

test('the session goes into the store and comes back out', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Save' }))
  // It comes back out as unknown: what was in localStorage at startup is
  // whatever was in localStorage.
  expect(getByText(JSON.stringify(signedIn))).toBeDefined()
})

function LogoutHelper(props: { onLoggedOut: () => void }): React.JSX.Element {
  const { logout } = useLogout()
  return (
    <button
      type='button'
      onClick={() => {
        void (async (): Promise<void> => {
          await logout({
            userId: signedIn.user.id,
            body: { refreshToken: signedIn.refreshToken },
          })
          props.onLoggedOut()
        })()
      }}
    >
      Logout
    </button>
  )
}

test('logout', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${signedIn.user.id}/sign-out`,
    response: { success: true },
    status: 200,
  })

  const onLoggedOut = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <LogoutHelper onLoggedOut={onLoggedOut} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    expect(onLoggedOut).toHaveBeenCalled()
  })
})

function ChangePasswordHelper(props: { userId: string }): React.JSX.Element {
  const { changePassword, isLoading } = useChangePassword()
  const result = usePasswordChangeResult()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{result}</div>
      <button
        type='button'
        onClick={() => {
          void changePassword({
            userId: props.userId,
            body: {
              oldPassword: 'oldpassword',
              newPassword: 'newpassword',
            },
          })
        }}
      >
        Change password
      </button>
    </div>
  )
}

interface PasswordChangeTest {
  name: string
  status: number
  result: string
}

const passwordChangeTests: PasswordChangeTest[] = [
  { name: 'success', status: 200, result: 'SUCCESS' },
  { name: 'fail', status: 400, result: 'ERROR' },
]

passwordChangeTests.forEach((testCase) => {
  test(`change password: ${testCase.name}`, async () => {
    const user = setupUser()
    const userId = '00448764-b114-4c54-a409-05b23d14de14'
    server?.addResponse({
      method: 'POST',
      pathname: `/api/v1/user/${userId}/change-password`,
      response: { success: true },
      status: testCase.status,
    })

    const { getByRole, getByText } = render(
      <StoreProvider>
        <ChangePasswordHelper userId={userId} />
      </StoreProvider>,
    )

    await user.click(getByRole('button', { name: 'Change password' }))
    // Whether the change went through is state the store keeps, not something
    // the call gives back.
    await waitFor(() => {
      expect(getByText(testCase.result)).toBeDefined()
    })
  })
})

test('change password after token refresh', async () => {
  const user = setupUser()
  const userId = '53e994bf-c4e7-4ec3-bbeb-a4b64591da00'
  const session = {
    user: { id: userId, username: 'admin', role: 'admin' },
    authToken: 'auth',
    refreshToken: 'refresh',
  }

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { authToken: 'refreshedauth', refreshToken: 'refreshedrefresh' },
    status: 200,
  })
  // Served after the failing one above so that the request is retried with a
  // refreshed token.
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={session} />
      <ChangePasswordHelper userId={userId} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))

  await user.click(getByRole('button', { name: 'Change password' }))
  await waitFor(() => {
    expect(getByText('SUCCESS')).toBeDefined()
  })
})

test('log out on failed token refresh', async () => {
  const user = setupUser()
  const userId = '7d869f30-4220-4910-9c2d-d4449aff8a79'
  const session = {
    user: { id: userId, username: 'admin', role: 'admin' },
    authToken: 'auth',
    refreshToken: 'refresh',
  }

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { data: { authToken: 'auth', refreshToken: 'refresh' } },
    status: 500,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={session} />
      <ChangePasswordHelper userId={userId} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))
  expect(getByText(JSON.stringify(session))).toBeDefined()

  await user.click(getByRole('button', { name: 'Change password' }))
  // A refresh that fails ends the session, which is the one way the store
  // changes it without being asked.
  await waitFor(() => {
    expect(
      getByText(
        JSON.stringify({ user: undefined, authToken: '', refreshToken: '' }),
      ),
    ).toBeDefined()
  })
})
