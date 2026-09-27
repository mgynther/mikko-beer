import { beforeAll, beforeEach, afterAll, test } from '../test'
import { assertCalled, assertDefined } from '../assert'
import { mockFunction } from '../mock'
import { render, waitFor } from '../render'

import { createServer } from './server'
import type { TestServer } from './server'
import { setupUser } from '../user-event'

import { StoreProvider } from '../../src/store/provider'
import {
  useCreateUser,
  useDeleteUser,
  useListUsers,
} from '../../src/store/user'
import { createErrorLogger } from '../error-logger'

// See store/beer.test.tsx for what the store layer's tests are for and why
// the helpers render the data as text.
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

const userId = 'b3c4d5e6-f708-419a-8b2c-3d4e5f6a7b8c'
const testUser = {
  id: userId,
  username: 'testuser',
  role: 'viewer',
}

const createRequest = {
  user: { role: 'viewer' },
  passwordSignInMethod: {
    username: testUser.username,
    password: 'testpassword',
  },
}

function ListUsersHelper(): React.JSX.Element {
  const { data, isLoading } = useListUsers()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
    </div>
  )
}

test('list users', async () => {
  const expectedResponse = { users: [testUser] }
  server?.addResponse({
    method: 'GET',
    pathname: '/api/v1/user',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <StoreProvider>
      <ListUsersHelper />
    </StoreProvider>,
  )

  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(expectedResponse)))
  })
  assertDefined(getByText('Not loading'))
})

function CreateUserHelper(): React.JSX.Element {
  const { create, data, hasError, isLoading } = useCreateUser()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <div>{data === undefined ? 'No data' : JSON.stringify(data)}</div>
      <button
        type='button'
        onClick={() => {
          create(createRequest).catch(
            createErrorLogger('create failed', console.error),
          )
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create user', async () => {
  const user = setupUser()
  const expectedResponse = { user: testUser }
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/user',
    response: expectedResponse,
    status: 201,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateUserHelper />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertDefined(getByText(JSON.stringify(expectedResponse)))
  })
  assertDefined(getByText('Not failed'))
  assertDefined(getByText('Not loading'))
})

test('fail to create user', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'POST',
    pathname: '/api/v1/user',
    response: { error: { code: 'UserAlreadyExists' } },
    status: 409,
  })

  const { getByRole, getByText } = render(
    <StoreProvider>
      <CreateUserHelper />
    </StoreProvider>,
  )

  // The creation does not reject: the failure is reported through hasError,
  // which is what the form that calls it reads.
  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertDefined(getByText('Failed'))
  })
  assertDefined(getByText('No data'))
})

function DeleteUserHelper(props: { onDeleted: () => void }): React.JSX.Element {
  const { delete: deleteUser } = useDeleteUser()
  return (
    <button
      type='button'
      onClick={() => {
        ;(async (): Promise<void> => {
          await deleteUser(userId)
          props.onDeleted()
        })().catch(createErrorLogger('deleteUser failed', console.error))
      }}
    >
      Delete
    </button>
  )
}

test('delete user', async () => {
  const user = setupUser()
  server?.addResponse({
    method: 'DELETE',
    pathname: `/api/v1/user/${userId}`,
    response: undefined,
    status: 204,
  })

  const onDeleted = mockFunction()
  const { getByRole } = render(
    <StoreProvider>
      <DeleteUserHelper onDeleted={onDeleted} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Delete' }))
  await waitFor(() => {
    assertCalled(onDeleted)
  })
})
