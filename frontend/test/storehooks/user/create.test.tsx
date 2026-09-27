import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import createUser from '../../../src/storehooks/user/create'
import type {
  CreateUserRequest,
  UseCreateUser,
  ValidateUserOrUndefined,
} from '../../../src/storehooks/user/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildUser } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedUser = buildUser({ username: 'validateduser' })

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
          create(request).catch(
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
  const onCreate = mockFunction<[user: CreateUserRequest]>()
  const onValidate = mockFunction<[result: unknown]>()

  const { getByRole, getByText } = render(
    <Helper
      data={created}
      hasError={false}
      onCreate={onCreate}
      onValidate={onValidate}
    />,
  )
  assertDefined(getByText(validatedUser.username))
  assertDefined(getByText('Not failed'))
  assertDefined(getByText('Not loading'))

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    assertCalledWith(onCreate, [request])
  })
  // The envelope is unwrapped before the validator sees the user.
  assertCalledWith(onValidate, [created.user])
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

  assertDefined(getByText('No user'))
  assertDefined(getByText('Failed'))
})
