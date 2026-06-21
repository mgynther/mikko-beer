import { render } from '@testing-library/react'
import { test } from 'vitest'
import Account from './Account'
import { Role } from '../../core/user/types'
import type { ChangePasswordIf, GetLogin } from '../../core/login/types'
import { PasswordChangeResult } from '../../core/login/types'

test('renders account', async () => {
  const getLogin: GetLogin = () => ({
    user: {
      id: '7b8a119b-5233-4c36-a483-1b10a97bbc1c',
      username: 'admin',
      role: Role.admin,
    },
    authToken: 'dummy',
    refreshToken: 'dummy',
  })
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
  const { getByRole, getByText } = render(
    <Account getLogin={getLogin} changePasswordIf={changePasswordIf} />,
  )
  getByRole('heading', { name: 'Account' })
  getByText('Username: admin')
})
