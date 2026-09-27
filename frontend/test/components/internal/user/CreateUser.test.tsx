import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import CreateUser from '../../../../src/components/internal/user/CreateUser'
import { Role } from '../../../../src/components/types/user/types'
import type { CreateUserRequest } from '../../../../src/components/types/user/types'

interface CreateTest {
  role: Role
  label: string
}

const createTests: CreateTest[] = [
  {
    role: Role.admin,
    label: 'Admin',
  },
  {
    role: Role.viewer,
    label: 'Viewer',
  },
]

createTests.forEach((testCase) => {
  test('creates user', async () => {
    const user = setupUser()
    const create = mockFunction<[user: CreateUserRequest], Promise<void>>(
      async () => undefined,
    )
    const { getByRole, getByPlaceholderText } = render(
      <CreateUser
        createUserIf={{
          useCreate: () => ({
            create,
            user: undefined,
            hasError: false,
            isLoading: false,
          }),
        }}
      />,
    )
    const usernameInput = getByPlaceholderText('Username')
    const username = 'username'
    await user.type(usernameInput, username)
    const passwordInput = getByPlaceholderText('Password')
    const password = 'password'
    await user.type(passwordInput, password)
    const passwordConfirmationInput = getByPlaceholderText(
      'Password confirmation',
    )
    await user.type(passwordConfirmationInput, password)
    const roleSelect = getByRole('combobox')
    await user.click(roleSelect)
    const adminOption = getByRole('option', { name: testCase.label })
    await user.selectOptions(roleSelect, adminOption)

    const createButton = getByRole('button', { name: 'Create' })
    assertEqual(createButton.hasAttribute('disabled'), false)
    await user.click(createButton)
    assertDeepEqual(create.mock.calls, [
      [
        {
          passwordSignInMethod: {
            username,
            password,
          },
          user: {
            role: testCase.role,
          },
        },
      ],
    ])
  })
})

test('shows error', async () => {
  const create = mockFunction<[user: CreateUserRequest], Promise<void>>(
    async () => undefined,
  )
  const { getByText } = render(
    <CreateUser
      createUserIf={{
        useCreate: () => ({
          create,
          user: undefined,
          hasError: true,
          isLoading: false,
        }),
      }}
    />,
  )
  getByText('Creating failed. Please check the username and passwords.')
})

test('shows created text', async () => {
  const create = mockFunction<[user: CreateUserRequest], Promise<void>>(
    async () => undefined,
  )
  const { getByText } = render(
    <CreateUser
      createUserIf={{
        useCreate: () => ({
          create,
          user: {
            id: '2d793bca-0989-4caa-8e7b-7bd72ddcadcc',
            username: 'admin',
            role: 'admin',
          },
          hasError: false,
          isLoading: false,
        }),
      }}
    />,
  )
  getByText('Created!')
})
