import { beforeAll, beforeEach, afterAll, test } from '../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDeepEqual,
  assertDefined,
  assertEqual,
} from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import type { ReceivedRequest, TestServer } from './server'
import { setupUser } from '../user-event'

import { StoreProvider } from '../../src/store/provider'
import {
  clearSession,
  readSession,
  writeSession,
} from '../../src/store/internal/session'
import type { Session } from '../../src/store/internal/session-parser'
import {
  useChangePassword,
  useLogin,
  useLogout,
  usePasswordChangeResult,
  useSaveLogin,
  useStoredLogin,
} from '../../src/store/login'
import { createErrorLogger } from '../error-logger'

// See store/beer.test.tsx for what the store layer's tests are for. The
// session the store keeps is tested here too: it is what the refresh handling
// changes behind the caller's back, and what another browser tab changes
// behind this one's. A test plays that other tab by changing the session from
// onRequest, while a request of this one is on its way.
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
          ;(async (): Promise<void> => {
            const response = await login({
              username: props.username,
              password: 'password1',
            })
            props.onResponse(response.isSuccess, response.data)
          })().catch(createErrorLogger('login failed', console.error))
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

  const onResponse = mockFunction<[isSuccess: boolean, data: unknown]>()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <LoginHelper username='user1' onResponse={onResponse} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    assertCalledWith(onResponse, [true, signedIn])
  })
  await waitFor(() => {
    assertDefined(getByText('Not loading'))
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

  const onResponse = mockFunction<[isSuccess: boolean, data: unknown]>()
  const { getByRole } = render(
    <StoreProvider>
      <LoginHelper username='user2' onResponse={onResponse} />
    </StoreProvider>,
  )

  // Wrong credentials are what the user asked about, not a failure to reach
  // the backend, so the caller is told rather than thrown at.
  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    assertCalledWith(onResponse, [false, undefined])
  })
})

function SessionHelper(props: { login: Session }): React.JSX.Element {
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

// What the stored login looks like once nobody is logged in: no user.
const loggedOut = JSON.stringify({})

test('saving a login stores the session and gives out the user', async () => {
  const user = setupUser()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Save' }))
  // It comes back out as unknown: what was in localStorage at startup is
  // whatever was in localStorage.
  assertDefined(getByText(JSON.stringify({ user: signedIn.user })))
  assertDeepEqual(readSession(), signedIn)
})

function LogoutHelper(props: { onLoggedOut: () => void }): React.JSX.Element {
  const { logout } = useLogout()
  return (
    <button
      type='button'
      onClick={() => {
        ;(async (): Promise<void> => {
          await logout()
          props.onLoggedOut()
        })().catch(createErrorLogger('logout failed', console.error))
      }}
    >
      Logout
    </button>
  )
}

test('logout ends the stored session', async () => {
  const user = setupUser()
  const onRequest = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${signedIn.user.id}/sign-out`,
    response: { success: true },
    status: 200,
    onRequest,
  })

  const onLoggedOut = mockFunction<[]>()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
      <LogoutHelper onLoggedOut={onLoggedOut} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    assertCalled(onLoggedOut)
  })
  assertCalledWith(onRequest, [
    {
      authorization: `Bearer ${signedIn.authToken}`,
      body: { refreshToken: signedIn.refreshToken },
    },
  ])
  assertDefined(getByText(loggedOut))
  assertEqual(readSession(), undefined)
})

test('logout after another tab ended the session sends nothing', async () => {
  const user = setupUser()
  const onRequest = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${signedIn.user.id}/sign-out`,
    response: { success: true },
    status: 200,
    onRequest,
  })

  const onLoggedOut = mockFunction<[]>()
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
      <LogoutHelper onLoggedOut={onLoggedOut} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))
  clearSession()

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    assertCalled(onLoggedOut)
  })
  assertCallCount(onRequest, 0)
  assertDefined(getByText(loggedOut))
})

const passwordChange = {
  oldPassword: 'oldpassword',
  newPassword: 'newpassword',
}

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
          changePassword({
            userId: props.userId,
            body: passwordChange,
          }).catch(createErrorLogger('changePassword failed', console.error))
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
      assertDefined(getByText(testCase.result))
    })
  })
})

test('signing in clears the result of an earlier password change', async () => {
  const user = setupUser()
  const userId = signedIn.user.id
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { error: 'InvalidCredentials' },
    status: 400,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
      <ChangePasswordHelper userId={userId} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Change password' }))
  await waitFor(() => {
    assertDefined(getByText('ERROR'))
  })

  await user.click(getByRole('button', { name: 'Save' }))
  assertDefined(getByText('UNDEFINED'))
})

function sessionOf(userId: string, tokenSuffix: string): Session {
  return {
    authToken: `auth${tokenSuffix}`,
    refreshToken: `refresh${tokenSuffix}`,
    user: { id: userId, username: 'admin', role: 'admin' },
  }
}

test('retry with a refreshed session after a 401', async () => {
  const user = setupUser()
  const userId = '53e994bf-c4e7-4ec3-bbeb-a4b64591da00'
  const session = sessionOf(userId, '1')
  const refreshed = sessionOf(userId, '2')

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  const onRefresh = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: {
      authToken: refreshed.authToken,
      refreshToken: refreshed.refreshToken,
    },
    status: 200,
    onRequest: onRefresh,
  })
  // Served after the failing one above so that the request is retried with a
  // refreshed token.
  const onRetry = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
    onRequest: onRetry,
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
    assertDefined(getByText('SUCCESS'))
  })
  assertCalledWith(onRefresh, [
    { authorization: undefined, body: { refreshToken: session.refreshToken } },
  ])
  assertCalledWith(onRetry, [
    { authorization: `Bearer ${refreshed.authToken}`, body: passwordChange },
  ])
  assertDeepEqual(readSession(), refreshed)
})

test('log out on failed token refresh', async () => {
  const user = setupUser()
  const userId = '7d869f30-4220-4910-9c2d-d4449aff8a79'
  const session = sessionOf(userId, '1')

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { error: 'InvalidCredentials' },
    status: 401,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={session} />
      <ChangePasswordHelper userId={userId} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))
  assertDefined(getByText(JSON.stringify({ user: session.user })))

  await user.click(getByRole('button', { name: 'Change password' }))
  // A refresh that fails ends the session, which is the one way the store
  // changes it without being asked.
  await waitFor(() => {
    assertDefined(getByText(loggedOut))
  })
  assertEqual(readSession(), undefined)
})

test('retry without refreshing after another tab refreshed', async () => {
  const user = setupUser()
  const userId = 'a4c1e7b2-5d3f-4a8e-9b6c-1e2d3f4a5b6c'
  const session = sessionOf(userId, '1')
  const refreshedElsewhere = sessionOf(userId, '2')

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
    onRequest: () => {
      writeSession(refreshedElsewhere)
    },
  })
  // Answers a refresh, if one is sent.
  const onRefresh = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { authToken: 'auth3', refreshToken: 'refresh3' },
    status: 200,
    onRequest: onRefresh,
  })
  const onRetry = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
    onRequest: onRetry,
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
    assertDefined(getByText('SUCCESS'))
  })
  assertCallCount(onRefresh, 0)
  assertCalledWith(onRetry, [
    {
      authorization: `Bearer ${refreshedElsewhere.authToken}`,
      body: passwordChange,
    },
  ])
  assertDeepEqual(readSession(), refreshedElsewhere)
})

test('retry with the session of the tab that won a refresh', async () => {
  const user = setupUser()
  const userId = 'c7e2a9d4-1b6f-4c3e-8a5d-9f0e1d2c3b4a'
  const session = sessionOf(userId, '1')
  const refreshedElsewhere = sessionOf(userId, '2')

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  // The other tab refreshed with the same token a moment earlier, so this
  // one's token is spent.
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { error: 'InvalidCredentials' },
    status: 401,
    onRequest: () => {
      writeSession(refreshedElsewhere)
    },
  })
  const onRetry = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
    onRequest: onRetry,
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
    assertDefined(getByText('SUCCESS'))
  })
  assertCalledWith(onRetry, [
    {
      authorization: `Bearer ${refreshedElsewhere.authToken}`,
      body: passwordChange,
    },
  ])
  assertDefined(getByText(JSON.stringify({ user: session.user })))
  assertDeepEqual(readSession(), refreshedElsewhere)
})

test('log out without refreshing after another tab logged out', async () => {
  const user = setupUser()
  const userId = 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b'
  const session = sessionOf(userId, '1')

  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
    onRequest: () => {
      clearSession()
    },
  })
  // Answers a refresh, if one is sent.
  const onRefresh = mockFunction<[request: ReceivedRequest]>()
  server?.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { authToken: 'auth2', refreshToken: 'refresh2' },
    status: 200,
    onRequest: onRefresh,
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
    assertDefined(getByText(loggedOut))
  })
  assertCallCount(onRefresh, 0)
})
