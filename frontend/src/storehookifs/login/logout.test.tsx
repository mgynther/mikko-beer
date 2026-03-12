import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import logout from './logout'
import { render, waitFor } from '@testing-library/react'
import { Provider, useSelector } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'
import { selectLogin, success } from '../../store/login/reducer'
import { Role } from '../../core/user/types'

interface Props {
  userId: string
  refreshToken: string
}

function Helper({ userId, refreshToken }: Props): React.JSX.Element {
  const logoutIf = logout()
  const { logout: doLogout } = logoutIf.useLogout()
  const loginState = useSelector(selectLogin)
  return (
    <div>
      {loginState.user !== undefined && (
        <div>{loginState.user.username}</div>
      )}
      <Button
        onClick={() => {
          void doLogout({ userId, body: { refreshToken } })
        }}
        text='Logout'
      />
    </div>
  )
}

test('logout', async () => {
  const user = userEvent.setup()

  const userId = '60a67ae0-a806-4b69-a899-5c1698d8b397'
  const username = 'user1'
  const refreshToken = 'refreshtoken'

  store.dispatch(success({
    authToken: 'authtoken',
    refreshToken,
    user: {
      id: userId,
      username,
      role: Role.admin
    }
  }))

  const { getByRole, getByText, queryByText } = render(
    <Provider store={store}>
      <Helper userId={userId} refreshToken={refreshToken} />
    </Provider>
  )
  expect(getByText(username)).toBeDefined()

  addTestServerResponse<Record<string, never>>({
    method: 'POST',
    pathname: `/api/v1/user/${userId}/sign-out`,
    response: {},
    status: 200
  })

  const logoutButton = getByRole('button', { name: 'Logout' })
  await user.click(logoutButton)
  await waitFor(() => {
    expect(queryByText(username)).toBeNull()
  })
})
