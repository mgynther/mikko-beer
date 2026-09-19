import { beforeAll, beforeEach, afterAll, expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import { createServer } from '../../test-util/server'
import type { TestServer } from '../../test-util/server'
import { setupUser } from '../../test-util/user-event'

import { StoreProvider } from './provider'
import { useCreateUser, useDeleteUser, useListUsers } from './user'

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
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not loading')).toBeDefined()
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
          void create(createRequest)
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
    expect(getByText(JSON.stringify(expectedResponse))).toBeDefined()
  })
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
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
    expect(getByText('Failed')).toBeDefined()
  })
  expect(getByText('No data')).toBeDefined()
})

function DeleteUserHelper(props: { onDeleted: () => void }): React.JSX.Element {
  const { delete: deleteUser } = useDeleteUser()
  return (
    <button
      type='button'
      onClick={() => {
        void (async (): Promise<void> => {
          await deleteUser(userId)
          props.onDeleted()
        })()
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

  const onDeleted = vitest.fn()
  const { getByRole } = render(
    <StoreProvider>
      <DeleteUserHelper onDeleted={onDeleted} />
    </StoreProvider>,
  )

  await user.click(getByRole('button', { name: 'Delete' }))
  await waitFor(() => {
    expect(onDeleted).toHaveBeenCalled()
  })
})
