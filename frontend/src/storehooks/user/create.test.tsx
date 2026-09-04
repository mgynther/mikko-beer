import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest'
import { store } from '../../store/store'
import { createServer } from '../../../test-util/server'
import type { TestServer } from '../../../test-util/server'
import createUser from './create'
import type { CreateUserRequest, User } from '../../types/user/types'
import { Role } from '../../types/user/types'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '../../react-redux-wrapper'

import Button from '../../components/common/Button'

let server: TestServer | undefined

beforeAll(() => {
  server = createServer()
})

beforeEach(() => {
  server?.clear()
})

afterAll(() => {
  server?.close()
})

interface HelperProps {
  request: CreateUserRequest
}

function Helper(props: HelperProps): React.JSX.Element {
  const createIf = createUser()
  const create = createIf.useCreate()
  const handleClick = (): void => {
    async function doHandle(): Promise<void> {
      await create.create(props.request)
    }
    void doHandle()
  }
  return (
    <div>
      {create.user !== undefined && <div>{create.user.username}</div>}
      <Button onClick={handleClick} text='Test' />
    </div>
  )
}

test('create user', async () => {
  const user = userEvent.setup()

  const expectedResponse: { user: User } = {
    user: {
      id: '999d495a-7b8e-4e44-a870-9f6e7d12254e',
      username: 'testuser',
      role: Role.viewer,
    },
  }

  server?.addResponse<{ user: User }>({
    method: 'POST',
    pathname: '/api/v1/user',
    response: expectedResponse,
    status: 201,
  })

  const { getByRole, getByText } = render(
    <Provider store={store}>
      <Helper
        request={{
          user: { role: Role.viewer },
          passwordSignInMethod: {
            username: expectedResponse.user.username,
            password: 'testpassword',
          },
        }}
      />
    </Provider>,
  )
  const testButton = getByRole('button', { name: 'Test' })
  await user.click(testButton)
  await waitFor(() => {
    expect(getByText(expectedResponse.user.username)).toBeDefined()
  })
})
