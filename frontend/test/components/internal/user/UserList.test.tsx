import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'
import { setupUser } from '../../../user-event'
import UserList from '../../../../src/components/internal/user/UserList'
import {
  type ListUsersIf,
  Role,
  type User,
} from '../../../../src/components/types/user/types'
import { dontCall } from '../../../dont-call'

const user1Id = 'b45e51cd-7acd-4f3b-8092-56f526ad9956'

const user1 = {
  id: user1Id,
  username: 'User 1',
  role: Role.viewer,
}

const oneUserListIf = (user: User): ListUsersIf => ({
  useList: () => ({
    data: {
      users: [user],
    },
    isLoading: false,
  }),
})

test('deletes user', async () => {
  const user = setupUser()
  const del = mockFunction<[userId: string], Promise<void>>(
    async () => undefined,
  )
  const { getByRole } = render(
    <UserList
      confirm={(): boolean => true}
      listUsersIf={oneUserListIf(user1)}
      deleteUserIf={{
        useDelete: () => ({
          delete: del,
        }),
      }}
    />,
  )
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  assertDeepEqual(del.mock.calls, [[user1Id]])
})

test('does not delete user when not confirmed', async () => {
  const user = setupUser()
  const del = mockFunction<[userId: string], Promise<void>>(
    async () => undefined,
  )
  const { getByRole } = render(
    <UserList
      confirm={(): boolean => false}
      listUsersIf={oneUserListIf(user1)}
      deleteUserIf={{
        useDelete: () => ({
          delete: del,
        }),
      }}
    />,
  )
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  assertDeepEqual(del.mock.calls, [])
})

test('renders users', () => {
  const user2Id = '5689ca51-4384-4cb8-9f5a-a1a7c2d4b974'
  const { getByText } = render(
    <UserList
      confirm={(): boolean => false}
      listUsersIf={{
        useList: () => ({
          data: {
            users: [
              user1,
              {
                id: user2Id,
                username: 'User 2',
                role: Role.admin,
              },
            ],
          },
          isLoading: false,
        }),
      }}
      deleteUserIf={{
        useDelete: () => ({
          delete: dontCall,
        }),
      }}
    />,
  )
  getByText('User 1 (viewer)')
  getByText('User 2 (admin)')
})
