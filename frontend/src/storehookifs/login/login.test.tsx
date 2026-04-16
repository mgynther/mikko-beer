import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import login from './login'
import type { Login } from '../../core/login/types'
import { render, waitFor } from '@testing-library/react'
import { Provider, useSelector } from '../../react-redux-wrapper'
import userEvent from '@testing-library/user-event'

import Button from '../../components/common/Button'
import { selectLogin } from '../../store/login/reducer'

interface Props {
  username: string
}

function Helper({ username }: Props): React.JSX.Element {
  const loginIf = login()
  const { login: doLogin } = loginIf.useLogin()
  const loginState = useSelector(selectLogin)
  return (
    <div>
      {loginState.user !== undefined && <div>{loginState.user.username}</div>}
      <Button
        onClick={() => {
          void doLogin({ username, password: 'password1' })
        }}
        text='Login'
      />
    </div>
  )
}

test('login', async () => {
  const user = userEvent.setup()

  const username = 'user1'
  const expectedResponse: Login = {
    authToken: 'authtoken1',
    refreshToken: 'refreshtoken1',
    user: {
      id: 'dcdafbc9-3fe6-485f-9821-05bd4a8b7eb3',
      username,
      role: 'admin',
    },
  }

  addTestServerResponse<Login>({
    method: 'POST',
    pathname: `/api/v1/user/sign-in`,
    response: expectedResponse,
    status: 200,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper username={username} />
    </Provider>,
  )
  const loginButton = getByRole('button', { name: 'Login' })
  await user.click(loginButton)
  await waitFor(() => {
    expect(getByText(username)).toBeDefined()
  })
})
