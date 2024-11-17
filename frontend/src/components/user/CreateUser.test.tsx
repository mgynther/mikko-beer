import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import CreateUser from './CreateUser'

test('creates user', async () => {
  const user = userEvent.setup()
  const create = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <CreateUser
      createUserIf={{
        useCreate: () => ({
          create,
          user: undefined,
          hasError: false,
          isLoading: false
        })
      }}
    />
  )
  const usernameInput = getByPlaceholderText('Username')
  const username = 'username'
  await user.type(usernameInput, username)
  const passwordInput = getByPlaceholderText('Password')
  const password = 'password'
  await user.type(passwordInput, password)
  const passwordConfirmationInput =
    getByPlaceholderText('Password confirmation')
  await user.type(passwordConfirmationInput, password)
  const role = 'admin'
  const roleSelect = getByRole('combobox')
  await user.click(roleSelect)
  const adminOption = getByRole('option', { name: 'Admin' })
  await user.selectOptions(roleSelect, adminOption)

  const createButton = getByRole('button', { name: 'Create' })
  expect(createButton.hasAttribute('disabled')).toEqual(false)
  await user.click(createButton)
  expect(create.mock.calls).toEqual([[{
    passwordSignInMethod: {
      username,
      password
    },
    user: {
      role
    }
  }]])
})

test('shows error', async () => {
  const create = vitest.fn()
  const { getByText } = render(
    <CreateUser
      createUserIf={{
        useCreate: () => ({
          create,
          user: undefined,
          hasError: true,
          isLoading: false
        })
      }}
    />
  )
  getByText('Creating failed. Please check the username and passwords.')
})

test('shows created text', async () => {
  const create = vitest.fn()
  const { getByText } = render(
    <CreateUser
      createUserIf={{
        useCreate: () => ({
          create,
          user: {
            id: '2d793bca-0989-4caa-8e7b-7bd72ddcadcc',
            username: 'admin',
            role: 'admin'
          },
          hasError: false,
          isLoading: false
        })
      }}
    />
  )
  getByText('Created!')
})
