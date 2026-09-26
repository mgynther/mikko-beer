import { render } from '@testing-library/react'
import { test } from 'vitest'
import Account from '../../../src/components/account/Account'
import type {
  ChangePasswordIf,
  GetLogin,
} from '../../../src/components/types/login/types'
import { buildLogin } from '../types/login/builders'
import { buildUser } from '../types/user/builders'

test('renders account', async () => {
  const getLogin: GetLogin = () =>
    buildLogin({ user: buildUser({ username: 'admin' }) })
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
  const { getByRole, getByText } = render(
    <Account getLogin={getLogin} changePasswordIf={changePasswordIf} />,
  )
  getByRole('heading', { name: 'Account' })
  getByText('Username: admin')
})
