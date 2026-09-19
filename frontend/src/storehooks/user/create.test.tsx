import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createUser from './create'
import type {
  CreateUserRequest,
  UseCreateUser,
  User,
  ValidateUserOrUndefined,
} from './types'
import { setupUser } from '../../../test-util/user-event'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedUser: User = {
  id: 'c7d8e9f0-a1b2-43c4-95d6-e7f8a9b0c1d2',
  username: 'validateduser',
  role: 'viewer',
}

const created = { user: { id: 'created', username: 'created', role: 'admin' } }

const request: CreateUserRequest = {
  user: { role: 'viewer' },
  passwordSignInMethod: {
    username: 'testuser',
    password: 'testpassword',
  },
}

interface HelperProps {
  data: unknown
  hasError: boolean
  onCreate: (user: CreateUserRequest) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateUser = () => ({
    create: async (user: CreateUserRequest): Promise<void> => {
      props.onCreate(user)
    },
    data: props.data,
    hasError: props.hasError,
    isLoading: false,
  })
  const validate: ValidateUserOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedUser
  }
  const { create, user, hasError, isLoading } = createUser(
    useStoreCreate,
    validate,
  ).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <div>{user === undefined ? 'No user' : user.username}</div>
      <button
        type='button'
        onClick={() => {
          void create(request)
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create user', async () => {
  const user = setupUser()
  const onCreate = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      data={created}
      hasError={false}
      onCreate={onCreate}
      onValidate={onValidate}
    />,
  )
  expect(getByText(validatedUser.username)).toBeDefined()
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onCreate).toHaveBeenCalledWith(request)
  })
  // The envelope is unwrapped before the validator sees the user.
  expect(onValidate).toHaveBeenCalledWith(created.user)
})

test('failed user creation has no user', () => {
  const { getByText } = render(
    <Helper
      data={undefined}
      hasError={true}
      onCreate={() => undefined}
      onValidate={() => undefined}
    />,
  )

  expect(getByText('No user')).toBeDefined()
  expect(getByText('Failed')).toBeDefined()
})
