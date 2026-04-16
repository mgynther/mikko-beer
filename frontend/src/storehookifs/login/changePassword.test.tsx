import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import changePassword from './changePassword'
import { render, waitFor } from '@testing-library/react'
import { Provider, useDispatch, useSelector } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'
import { PasswordChangeResult } from '../../core/login/types'
import { selectLogin, success } from '../../store/login/reducer'

interface Props {
  userId: string
}

function Helper({ userId }: Props): React.JSX.Element {
  const changePasswordIf = changePassword()
  const { changePassword: doChangePassword } =
    changePasswordIf.useChangePassword()
  const { getResult } = changePasswordIf.useGetPasswordChangeResult()
  const result = getResult()
  return (
    <div>
      <div>{result}</div>
      <Button
        onClick={() => {
          void doChangePassword({
            userId,
            body: {
              oldPassword: 'oldpassword',
              newPassword: 'newpassword',
            },
          })
        }}
        text='Change password'
      />
    </div>
  )
}

interface PasswordChangeTest {
  name: string
  status: number
  result: PasswordChangeResult
}

const passwordChangeTests: PasswordChangeTest[] = [
  {
    name: 'success',
    status: 200,
    result: PasswordChangeResult.SUCCESS,
  },
  {
    name: 'fail',
    status: 400,
    result: PasswordChangeResult.ERROR,
  },
]

passwordChangeTests.forEach((testCase) => {
  test(`change password: ${testCase.name}`, async () => {
    const user = userEvent.setup()

    const userId = '00448764-b114-4c54-a409-05b23d14de14'

    addTestServerResponse<{ success: true }>({
      method: 'POST',
      pathname: `/api/v1/user/${userId}/change-password`,
      response: { success: true },
      status: testCase.status,
    })

    const { getByRole, getByText } = render(
      <Provider store={store}>
        <Helper userId={userId} />
      </Provider>,
    )
    const changePasswordButton = getByRole('button', {
      name: 'Change password',
    })
    await user.click(changePasswordButton)
    await waitFor(() => {
      expect(getByText(testCase.result)).toBeDefined()
    })
  })
})

function LoginDispatcher({ userId }: Props): React.JSX.Element {
  const dispatch = useDispatch()
  dispatch(
    success({
      user: {
        id: userId,
        username: 'admin',
        role: 'admin',
      },
      authToken: 'auth',
      refreshToken: 'refresh',
    }),
  )
  return <div />
}

test('change password after token refresh', async () => {
  const user = userEvent.setup()

  const userId = '53e994bf-c4e7-4ec3-bbeb-a4b64591da00'

  render(
    <Provider store={store}>
      <LoginDispatcher userId={userId} />
    </Provider>,
  )

  addTestServerResponse<{ success: true }>({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })

  addTestServerResponse<{ data: { authToken: string; refreshToken: string } }>({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { data: { authToken: 'auth', refreshToken: 'refresh' } },
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper userId={userId} />
    </Provider>,
  )
  const changePasswordButton = getByRole('button', { name: 'Change password' })
  await user.click(changePasswordButton)

  addTestServerResponse<{ success: true }>({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 200,
  })

  await waitFor(() => {
    expect(getByText(PasswordChangeResult.SUCCESS)).toBeDefined()
  })
})

function LoginStatusHelper(): React.JSX.Element {
  const loginState = useSelector(selectLogin)
  const isLoggedIn = loginState.user !== undefined
  return <div>{isLoggedIn ? 'Logged in' : 'Logged out'}</div>
}

test('log out on failed token refresh', async () => {
  const user = userEvent.setup()

  const userId = '7d869f30-4220-4910-9c2d-d4449aff8a79'

  render(
    <Provider store={store}>
      <LoginDispatcher userId={userId} />
    </Provider>,
  )

  render(
    <Provider store={store}>
      <LoginStatusHelper />
    </Provider>,
  )

  addTestServerResponse<{ success: true }>({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/change-password`,
    response: { success: true },
    status: 401,
  })

  addTestServerResponse<{ data: { authToken: string; refreshToken: string } }>({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/refresh`,
    response: { data: { authToken: 'auth', refreshToken: 'refresh' } },
    status: 500,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper userId={userId} />
    </Provider>,
  )
  expect(getByText('Logged in')).toBeDefined()
  const changePasswordButton = getByRole('button', { name: 'Change password' })
  await user.click(changePasswordButton)
  await waitFor(() => {
    expect(getByText('Logged out')).toBeDefined()
  })
})
