import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Login from './Login'

test('logs in', async () => {
  const user = userEvent.setup()
  const login = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <Login
      loginIf={{
        useLogin: () => ({
          login,
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
  const submit = getByRole('button', { name: 'Login' })
  expect(submit.hasAttribute('disabled')).toEqual(false)
  await user.click(submit)
  expect(login.mock.calls).toEqual([[{
    username,
    password
  }]])
})
