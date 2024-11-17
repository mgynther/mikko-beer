import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UserList from './UserList'
import { Role, type User } from '../../core/user/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const user1Id = 'b45e51cd-7acd-4f3b-8092-56f526ad9956'

const user1 = {
  id: user1Id,
  username: 'User 1',
  role: Role.viewer
}

const oneUserListIf = (user: User) => ({
  useList: () => ({
    data: {
      users: [user],
    },
    isLoading: false
  })
})

test('deletes user', async () => {
  const user = userEvent.setup()
  const del = vitest.fn()
  const { getByRole } = render(
    <UserList
      getConfirm={() => () => true}
      listUsersIf={oneUserListIf(user1)}
      deleteUserIf={{
        useDelete: () => ({
          delete: del
        })
      }}
    />
  )
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  expect(del.mock.calls).toEqual([[user1Id]])
})

test('does not delete user when not confirmed', async () => {
  const user = userEvent.setup()
  const del = vitest.fn()
  const { getByRole } = render(
    <UserList
      getConfirm={() => () => false}
      listUsersIf={oneUserListIf(user1)}
      deleteUserIf={{
        useDelete: () => ({
          delete: del
        })
      }}
    />
  )
  const deleteButton = getByRole('button', { name: 'Delete' })
  await user.click(deleteButton)
  expect(del.mock.calls).toEqual([])
})

test('renders users', () => {
  const user2Id = '5689ca51-4384-4cb8-9f5a-a1a7c2d4b974'
  const { getByText } = render(
    <UserList
      getConfirm={() => () => false}
      listUsersIf={{
        useList: () => ({
          data: {
            users: [
              user1,
              {
                id: user2Id,
                username: 'User 2',
                role: Role.admin
              },
            ],
          },
          isLoading: false
        })
      }}
      deleteUserIf={{
        useDelete: () => ({
          delete: dontCall
        })
      }}
    />
  )
  getByText('User 1 (viewer)')
  getByText('User 2 (admin)')
})
