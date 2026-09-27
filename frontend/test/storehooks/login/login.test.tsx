import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import login from '../../../src/storehooks/login/login'
import type {
  Login,
  LoginParams,
  LoginResponse,
  UseLogin,
  UseSaveLogin,
  ValidateLogin,
} from '../../../src/storehooks/login/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildLogin } from './builders'

// Stubs for the store functions and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedLogin = buildLogin()

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
  const onLogin = mockFunction<[params: LoginParams]>()
  const onSave = mockFunction<[login: Login]>()
  const onValidate = mockFunction<[result: unknown]>()
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
    assertCalledWith(onSave, [validatedLogin])
  })
  assertDefined(getByText('Not loading'))
  assertCalledWith(onLogin, [params])
  assertCalledWith(onValidate, [data])
})

test('a failed login saves no session and does not reject', async () => {
  const user = setupUser()
  const onLogin = mockFunction<[params: LoginParams]>()
  const onSave = mockFunction<[login: Login]>()
  const onValidate = mockFunction<[result: unknown]>()
  const onError = mockFunction<[]>()

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
    assertCalledWith(onLogin, [params])
  })
  assertCallCount(onValidate, 0)
  assertCallCount(onSave, 0)
  assertCallCount(onError, 0)
})

test('a login that does not validate throws', async () => {
  const user = setupUser()
  const onSave = mockFunction<[login: Login]>()
  const onError = mockFunction<[]>()

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
    assertCalled(onError)
  })
  assertCallCount(onSave, 0)
})
