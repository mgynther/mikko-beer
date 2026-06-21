import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ChangePassword from './ChangePassword'
import { Role } from '../../core/user/types'
import type { ChangePasswordIf, GetLogin } from '../../core/login/types'
import { PasswordChangeResult } from '../../core/login/types'

const userId = '8f19eb81-b283-440f-be76-73c1c858150c'

const getLogin: GetLogin = () => ({
  user: {
    id: userId,
    username: 'admin',
    role: Role.admin,
  },
  authToken: 'dummy',
  refreshToken: 'dummy',
})

test('changes password', async () => {
  const user = userEvent.setup()
  const changePassword = vitest.fn()
  const changePasswordIf: ChangePasswordIf = {
    useChangePassword: () => ({
      changePassword,
      isLoading: false,
    }),
    useGetPasswordChangeResult: () => ({
      getResult: () => PasswordChangeResult.UNDEFINED,
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
  expect(submit.hasAttribute('disabled')).toEqual(false)
  await user.click(submit)
  expect(changePassword.mock.calls).toEqual([
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
      getResult: () => PasswordChangeResult.SUCCESS,
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
      getResult: () => PasswordChangeResult.ERROR,
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
      getResult: () => PasswordChangeResult.UNDEFINED,
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
  expect(container.childElementCount).toEqual(0)
})
