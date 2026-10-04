import { test } from '../test'
import {
  assertCalled,
  assertCalledWith,
  assertDeepEqual,
  assertDefined,
  assertEqual,
} from '../assert'
import { mockFunction } from '../mock'
import { fireEvent } from '../fire-event'
import { render, waitFor } from '../render'

import { createServer } from './server'
import { createMemoryStorage } from '../memory-storage'
import type { ReceivedRequest } from './server'
import { setupUser } from '../user-event'

import { createStoreProvider } from '../../src/store/provider'
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'POST',
    pathname: '/api/v1/user/sign-in',
    response: signedIn,
    status: 200,
  })

  const onResponse = mockFunction<[isSuccess: boolean, data: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'POST',
    pathname: '/api/v1/user/sign-in',
    response: { error: 'InvalidCredentials' },
    status: 401,
  })

  const onResponse = mockFunction<[isSuccess: boolean, data: unknown]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Save' }))
  // It comes back out as unknown: what was in localStorage at startup is
  // whatever was in localStorage.
  assertDefined(getByText(JSON.stringify({ user: signedIn.user })))
  assertDeepEqual(readSession(webStorage), signedIn)
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const onRequest = mockFunction<[request: ReceivedRequest]>()
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${signedIn.user.id}/sign-out`,
    response: { success: true },
    status: 200,
    onRequest,
  })

  const onLoggedOut = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  // The refresh token authorizes the sign-out on its own, so an auth token
  // that has expired cannot make it fail.
  assertCalledWith(onRequest, [
    {
      authorization: undefined,
      body: { refreshToken: signedIn.refreshToken },
    },
  ])
  assertDefined(getByText(loggedOut))
  assertEqual(readSession(webStorage), undefined)
})

test('logout answered 401 ends the session without refreshing', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  // The refresh token is no longer valid, so refreshing with it would fail
  // too. A refresh that succeeded would leave a token nobody signs out.
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${signedIn.user.id}/sign-out`,
    response: {
      error: { code: 'InvalidCredentials', message: 'invalid token' },
    },
    status: 401,
  })

  const onLoggedOut = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertDeepEqual(server.unsettled(), [])
  assertDefined(getByText(loggedOut))
  assertEqual(readSession(webStorage), undefined)
})

test('failed logout ends the session rather than rejecting', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${signedIn.user.id}/sign-out`,
    response: { error: { code: 'UnknownError', message: 'unknown error' } },
    status: 500,
  })

  const onLoggedOut = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertDefined(getByText(loggedOut))
  assertEqual(readSession(webStorage), undefined)
})

test('logout after another tab ended the session sends nothing', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const onLoggedOut = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={signedIn} />
      <LogoutHelper onLoggedOut={onLoggedOut} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))
  clearSession(webStorage)

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    assertCalled(onLoggedOut)
  })
  assertDeepEqual(server.unsettled(), [])
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
    const server = await createServer()
    const webStorage = createMemoryStorage()
    const user = setupUser()
    const userId = '00448764-b114-4c54-a409-05b23d14de14'
    server.addResponse({
      method: 'POST',
      pathname: `/api/v1/user/${userId}/change-password`,
      response: { success: true },
      status: testCase.status,
    })

    const StoreProvider = createStoreProvider(server.url, webStorage)
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = signedIn.user.id
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { error: 'InvalidCredentials' },
    status: 400,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = '53e994bf-c4e7-4ec3-bbeb-a4b64591da00'
  const session = sessionOf(userId, '1')
  const refreshed = sessionOf(userId, '2')

  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  const onRefresh = mockFunction<[request: ReceivedRequest]>()
  server.addResponse({
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
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
    onRequest: onRetry,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertDeepEqual(readSession(webStorage), refreshed)
})

test('log out on failed token refresh', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = '7d869f30-4220-4910-9c2d-d4449aff8a79'
  const session = sessionOf(userId, '1')

  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { error: 'InvalidCredentials' },
    status: 401,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertEqual(readSession(webStorage), undefined)
})

test('retry without refreshing after another tab refreshed', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = 'a4c1e7b2-5d3f-4a8e-9b6c-1e2d3f4a5b6c'
  const session = sessionOf(userId, '1')
  const refreshedElsewhere = sessionOf(userId, '2')

  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
    onRequest: () => {
      writeSession(webStorage, refreshedElsewhere)
    },
  })
  const onRetry = mockFunction<[request: ReceivedRequest]>()
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
    onRequest: onRetry,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertDeepEqual(server.unsettled(), [])
  assertCalledWith(onRetry, [
    {
      authorization: `Bearer ${refreshedElsewhere.authToken}`,
      body: passwordChange,
    },
  ])
  assertDeepEqual(readSession(webStorage), refreshedElsewhere)
})

test('retry with the session of the tab that won a refresh', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = 'c7e2a9d4-1b6f-4c3e-8a5d-9f0e1d2c3b4a'
  const session = sessionOf(userId, '1')
  const refreshedElsewhere = sessionOf(userId, '2')

  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  // The other tab refreshed with the same token a moment earlier, so this
  // one's token is spent.
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { error: 'InvalidCredentials' },
    status: 401,
    onRequest: () => {
      writeSession(webStorage, refreshedElsewhere)
    },
  })
  const onRetry = mockFunction<[request: ReceivedRequest]>()
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
    onRequest: onRetry,
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertDeepEqual(readSession(webStorage), refreshedElsewhere)
})

test('log out without refreshing after another tab logged out', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = 'e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b'
  const session = sessionOf(userId, '1')

  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
    onRequest: () => {
      clearSession(webStorage)
    },
  })

  const StoreProvider = createStoreProvider(server.url, webStorage)
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
  assertDeepEqual(server.unsettled(), [])
})

test('logout waits for a refresh and ends the refreshed session', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = 'f3b9c2d8-6a1e-4f7b-9c5d-2e8a4b6c1d3f'
  const session = sessionOf(userId, '1')
  const refreshed = sessionOf(userId, '2')

  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })
  // The user logs out while the refresh is on its way, so the refresh token
  // the logout would read at once is the one the refresh is spending.
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: {
      authToken: refreshed.authToken,
      refreshToken: refreshed.refreshToken,
    },
    status: 200,
    onRequest: () => {
      fireEvent.click(getByRole('button', { name: 'Logout' }))
    },
  })
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
  })
  const onSignOut = mockFunction<[request: ReceivedRequest]>()
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/sign-out`,
    response: { success: true },
    status: 200,
    onRequest: onSignOut,
  })

  const onLoggedOut = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={session} />
      <ChangePasswordHelper userId={userId} />
      <LogoutHelper onLoggedOut={onLoggedOut} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))

  await user.click(getByRole('button', { name: 'Change password' }))
  await waitFor(() => {
    assertCalled(onLoggedOut)
  })
  assertCalledWith(onSignOut, [
    {
      authorization: undefined,
      body: { refreshToken: refreshed.refreshToken },
    },
  ])
  assertDefined(getByText('SUCCESS'))
  assertDefined(getByText(loggedOut))
  assertEqual(readSession(webStorage), undefined)
})

test('a request made while logging out waits for the logout', async () => {
  const server = await createServer()
  const webStorage = createMemoryStorage()
  const user = setupUser()
  const userId = '8c4e2a6f-1d3b-4e9a-b7c5-3f1a9d2e6b8c'
  const session = sessionOf(userId, '1')

  // Sent alongside the sign-out, the request would be answered 401 and
  // refresh the session the sign-out is ending.
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/sign-out`,
    response: { success: true },
    status: 200,
    onRequest: () => {
      fireEvent.click(getByRole('button', { name: 'Change password' }))
    },
  })
  const onChangePassword = mockFunction<[request: ReceivedRequest]>()
  server.addResponse({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { error: 'InvalidCredentials' },
    status: 401,
    onRequest: onChangePassword,
  })

  const onLoggedOut = mockFunction<[]>()
  const StoreProvider = createStoreProvider(server.url, webStorage)
  const { getByRole, getByText } = render(
    <StoreProvider>
      <SessionHelper login={session} />
      <ChangePasswordHelper userId={userId} />
      <LogoutHelper onLoggedOut={onLoggedOut} />
    </StoreProvider>,
  )
  await user.click(getByRole('button', { name: 'Save' }))

  await user.click(getByRole('button', { name: 'Logout' }))
  await waitFor(() => {
    assertDefined(getByText('ERROR'))
  })
  assertCalledWith(onChangePassword, [
    { authorization: undefined, body: passwordChange },
  ])
  assertDeepEqual(server.unsettled(), [])
  assertDefined(getByText(loggedOut))
  assertEqual(readSession(webStorage), undefined)
})
