import { expect, test } from 'vitest'
import { store } from '../../store/store'
import { addTestServerResponse } from '../../../test-util/server'
import listUsers from './list'
import type { UserList } from '../../core/user/types'
import { render, waitFor } from '@testing-library/react'
import { Provider } from '../../react-redux-wrapper'

function Helper(): React.JSX.Element {
  const listIf = listUsers()
  const { data } = listIf.useList()
  return (
    <div>
      {data?.users.map((user) => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  )
}

test('list users', async () => {
  const expectedResponse: UserList = {
    users: [
      {
        id: '5de58dcf-e515-49ea-8a8b-5bf22d3087cb',
        username: 'testuser',
        role: 'admin',
      },
      {
        id: '3f5789eb-4802-4e79-b9b3-28f1c97234ea',
        username: 'anotheruser',
        role: 'viewer',
      },
    ],
  }

  addTestServerResponse<UserList>({
    method: 'GET',
    pathname: '/api/v1/user',
    response: expectedResponse,
    status: 200,
  })

  const { getByText } = render(
    <Provider store={store}>
      <Helper />
    </Provider>,
  )
  await waitFor(() => {
    expect(getByText(expectedResponse.users[0].username)).toBeDefined()
    expect(getByText(expectedResponse.users[1].username)).toBeDefined()
  })
})
