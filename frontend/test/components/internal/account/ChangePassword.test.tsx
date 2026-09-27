import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import ChangePassword from '../../../../src/components/internal/account/ChangePassword'
import type {
  ChangePasswordIf,
  GetLogin,
} from '../../../../src/components/types/login/types'
import { buildLogin } from '../../types/login/builders'
import { buildUser } from '../../types/user/builders'

// The parameters are not exported, as no layer needs them by name.
type ChangePasswordFunction = ReturnType<
  ChangePasswordIf['useChangePassword']
>['changePassword']

const userId = '8f19eb81-b283-440f-be76-73c1c858150c'

const getLogin: GetLogin = () => buildLogin({ user: buildUser({ id: userId }) })

test('changes password', async () => {
  const user = setupUser()
  const changePassword = mockFunction<Parameters<ChangePasswordFunction>>()
  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => ({
      changePassword,
      isLoading: false,
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => 'UNDEFINED',
    }),
    getLogin,
  }
  const { getByRole, getByPlaceholderText } = render(
    <ChangePassword changePasswordIf={changePasswordIf} />,
  )
  const oldPasswordInput = getByPlaceholderText('Old password')
  const oldPassword = 'old password'
  await user.type(oldPasswordInput, oldPassword)
  const newPasswordInput = getByPlaceholderText('New password')
  const newPassword = 'new password'
  await user.type(newPasswordInput, newPassword)
  const passwordConfirmationInput = getByPlaceholderText(
    'New password confirmation',
  )
  await user.type(passwordConfirmationInput, newPassword)
  const submit = getByRole('button', { name: 'Change' })
  assertEqual(submit.hasAttribute('disabled'), false)
  await user.click(submit)
  assertDeepEqual(changePassword.mock.calls, [
    [
      {
        userId,
        body: {
          oldPassword,
          newPassword,
        },
      },
    ],
  ])
})

test('shows password change result', async () => {
  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => ({
      changePassword: async () => undefined,
      isLoading: false,
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => 'SUCCESS',
    }),
    getLogin,
  }
  const { getByText } = render(
    <ChangePassword changePasswordIf={changePasswordIf} />,
  )
  getByText('Password changed!')
})

test('password change has failed', async () => {
  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => ({
      changePassword: async () => undefined,
      isLoading: false,
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => 'ERROR',
    }),
    getLogin,
  }
  const { getByText } = render(
    <ChangePassword changePasswordIf={changePasswordIf} />,
  )
  getByText('Change failed. Please check your old and new passwords.')
})

test('does not render on missing user', async () => {
  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => ({
      changePassword: async () => undefined,
      isLoading: false,
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => 'UNDEFINED',
    }),
    getLogin: () => ({
      user: undefined,
      authToken: '',
      refreshToken: '',
    }),
  }
  const { container } = render(
    <ChangePassword changePasswordIf={changePasswordIf} />,
  )
  assertEqual(container.childElementCount, 0)
})
