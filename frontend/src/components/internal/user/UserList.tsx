import React from 'react'

import type { DeleteUserIf, ListUsersIf, User } from '../../types/user/types'
import type { Confirm } from '../confirm'

import Button from '../common/Button'
import LoadingIndicator from '../common/LoadingIndicator'
import { createErrorLogger } from '../error-logger'

interface Props {
  confirm: Confirm
  deleteUserIf: DeleteUserIf
  listUsersIf: ListUsersIf
}

function UserList(props: Props): React.JSX.Element {
  const { data: userData, isLoading } = props.listUsersIf.useList()
  const { delete: del } = props.deleteUserIf.useDelete()

  async function confirmDeleteUser(user: User): Promise<void> {
    const confirmText = `Are you sure you want to delete "${user.username}"?`
    if (props.confirm(confirmText)) {
      await del(user.id)
    }
  }

  const userArray = userData?.users === undefined ? [] : [...userData.users]
  const users = userArray.sort((a, b) => a.username.localeCompare(b.username))

  return (
    <>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {users.map((user: User) => (
          <li key={user.id}>
            {user.username} ({user.role}){' '}
            <Button
              onClick={() => {
                confirmDeleteUser(user).catch(
                  createErrorLogger('confirmDeleteUser failed', console.error),
                )
              }}
              text='Delete'
            />
          </li>
        ))}
      </ul>
    </>
  )
}

export default UserList
