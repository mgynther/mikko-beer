import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import login from './login'
import type {
  Login,
  LoginParams,
  LoginResponse,
  UseLogin,
  UseSaveLogin,
  ValidateLogin,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store functions and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedLogin: Login = {
  authToken: 'validatedauthtoken',
  refreshToken: 'validatedrefreshtoken',
  user: {
    id: 'c6d7e8f9-0112-4233-8445-566778899aab',
    username: 'validateduser',
    role: 'admin',
  },
}

const params: LoginParams = { username: 'user1', password: 'password1' }

interface HelperProps {
  response: LoginResponse
  onLogin: (params: LoginParams) => void
  onSave: (login: Login) => void
  onError: () => void
  validate: ValidateLogin
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreLogin: UseLogin = () => ({
    login: async (loginParams: LoginParams): Promise<LoginResponse> => {
      props.onLogin(loginParams)
      return props.response
    },
    isLoading: false,
  })
  const useSaveLogin: UseSaveLogin = () => props.onSave
  const { login: doLogin, isLoading } = login(
    useStoreLogin,
    useSaveLogin,
    props.validate,
  ).useLogin()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            try {
              await doLogin(params)
            } catch {
              props.onError()
            }
          })().catch(createErrorLogger('doLogin failed', console.error))
        }}
      >
        Login
      </button>
    </div>
  )
}

test('login', async () => {
  const user = setupUser()
  const onLogin = vitest.fn()
  const onSave = vitest.fn()
  const onValidate = vitest.fn()
  const data = { authToken: 'token', refreshToken: 'refresh' }

  const { getByRole, getByText } = render(
    <Helper
      response={{ isSuccess: true, data }}
      onLogin={onLogin}
      onSave={onSave}
      onError={() => undefined}
      validate={(result: unknown) => {
        onValidate(result)
        return validatedLogin
      }}
    />,
  )

  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    // What the validator returned is what the session is made of.
    expect(onSave).toHaveBeenCalledWith(validatedLogin)
  })
  expect(getByText('Not loading')).toBeDefined()
  expect(onLogin).toHaveBeenCalledWith(params)
  expect(onValidate).toHaveBeenCalledWith(data)
})

test('a failed login saves no session and does not reject', async () => {
  const user = setupUser()
  const onLogin = vitest.fn()
  const onSave = vitest.fn()
  const onValidate = vitest.fn()
  const onError = vitest.fn()

  const { getByRole } = render(
    <Helper
      response={{ isSuccess: false, data: undefined }}
      onLogin={onLogin}
      onSave={onSave}
      onError={onError}
      validate={(result: unknown) => {
        onValidate(result)
        return validatedLogin
      }}
    />,
  )

  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    expect(onLogin).toHaveBeenCalledWith(params)
  })
  expect(onValidate).not.toHaveBeenCalled()
  expect(onSave).not.toHaveBeenCalled()
  expect(onError).not.toHaveBeenCalled()
})

test('a login that does not validate throws', async () => {
  const user = setupUser()
  const onSave = vitest.fn()
  const onError = vitest.fn()

  const { getByRole } = render(
    <Helper
      response={{ isSuccess: true, data: { authToken: 1 } }}
      onLogin={() => undefined}
      onSave={onSave}
      onError={onError}
      validate={() => {
        throw Error('Could not validate data')
      }}
    />,
  )

  await user.click(getByRole('button', { name: 'Login' }))
  await waitFor(() => {
    expect(onError).toHaveBeenCalled()
  })
  expect(onSave).not.toHaveBeenCalled()
})
