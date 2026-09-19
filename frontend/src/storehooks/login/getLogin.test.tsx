import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getLogin from './getLogin'
import type { Login, UseStoredLogin, ValidateLogin } from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The session is read back out of the store
// here, so what this proves is that the stored value goes through the
// validator and that a value the validator rejects is reported as logged out.
const validatedLogin: Login = {
  authToken: 'validatedauthtoken',
  refreshToken: 'validatedrefreshtoken',
  user: {
    id: 'd7e8f901-1223-4344-8556-6778899aabbc',
    username: 'validateduser',
    role: 'admin',
  },
}

interface HelperProps {
  stored: unknown
  onValidate: (result: unknown) => void
  validate: ValidateLogin
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoredLogin: UseStoredLogin = () => props.stored
  const login = getLogin(useStoredLogin, (result: unknown) => {
    props.onValidate(result)
    return props.validate(result)
  })()
  return (
    <div>
      <div>{login.user === undefined ? 'No user' : login.user.username}</div>
      <div>{login.authToken.length === 0 ? 'No token' : login.authToken}</div>
    </div>
  )
}

test('get login', () => {
  const onValidate = vitest.fn()
  const stored = { authToken: 'stored', refreshToken: 'refresh' }

  const { getByText } = render(
    <Helper
      stored={stored}
      onValidate={onValidate}
      validate={() => validatedLogin}
    />,
  )

  expect(getByText(validatedLogin.authToken)).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(stored)
})

test('get logged out when the stored session does not validate', () => {
  // What localStorage held at startup is whatever was in localStorage.
  const { getByText } = render(
    <Helper
      stored={{ authToken: 1 }}
      onValidate={() => undefined}
      validate={() => {
        throw Error('Could not validate data')
      }}
    />,
  )

  expect(getByText('No user')).toBeDefined()
  expect(getByText('No token')).toBeDefined()
})
