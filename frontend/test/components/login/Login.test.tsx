import { test } from '../../test'
import { assertDeepEqual, assertEqual } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'
import { setupUser } from '../../user-event'
import Login from '../../../src/components/login/Login'

test('logs in', async () => {
  const user = setupUser()
  const login = mockFunction()
  const { getByRole, getByPlaceholderText } = render(
    <Login
      loginIf={{
        useLogin: () => ({
          login,
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
  const submit = getByRole('button', { name: 'Login' })
  assertEqual(submit.hasAttribute('disabled'), false)
  await user.click(submit)
  assertDeepEqual(login.mock.calls, [
    [
      {
        username,
        password,
      },
    ],
  ])
})
