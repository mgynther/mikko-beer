import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import ChangePassword from './ChangePassword'
import { Role } from '../../core/user/types'
import { PasswordChangeResult } from '../../core/login/types'

const userId = '8f19eb81-b283-440f-be76-73c1c858150c'

test('changes password', async () => {
  const user = userEvent.setup()
  const changePassword = vitest.fn()
  const { getByRole, getByPlaceholderText } = render(
    <ChangePassword
      getLogin={() => ({
        user: {
          id: userId,
          username: 'admin',
          role: Role.admin
        },
        authToken: 'dummy',
        refreshToken: 'dummy'
      })}
      changePasswordIf={{
        useChangePassword: () => ({
          changePassword,
          isLoading: false
        }),
        useGetPasswordChangeResult: () => ({
          getResult: () => PasswordChangeResult.SUCCESS
        })
      }}
    />
  )
  const oldPasswordInput = getByPlaceholderText('Old password')
  const oldPassword = 'old password'
  await user.type(oldPasswordInput, oldPassword)
  const newPasswordInput = getByPlaceholderText('New password')
  const newPassword = 'new password'
  await user.type(newPasswordInput, newPassword)
  const passwordConfirmationInput =
    getByPlaceholderText('New password confirmation')
  await user.type(passwordConfirmationInput, newPassword)
  const submit = getByRole('button', { name: 'Change' })
  expect(submit.hasAttribute('disabled')).toEqual(false)
  await user.click(submit)
  expect(changePassword.mock.calls).toEqual([[{
    userId,
    body: {
      oldPassword,
      newPassword
    }
  }]])
})
