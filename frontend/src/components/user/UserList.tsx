import type {
  DeleteUserIf,
  ListUsersIf,
  User
} from '../../core/user/types'

import LoadingIndicator from '../common/LoadingIndicator'

interface Props {
  // Giving confirm loses context and results in illegal invocation when used.
  getConfirm: () => (text: string) => boolean
  deleteUserIf: DeleteUserIf
  listUsersIf: ListUsersIf
}

function UserList (props: Props): JSX.Element {
  const { data: userData, isLoading } = props.listUsersIf.useList()
  const { delete: del } = props.deleteUserIf.useDelete()

  async function confirmDeleteUser (user: User): Promise<void> {
    const confirmText = `Are you sure you want to delete "${user.username}"?`
    if (props.getConfirm()(confirmText)) {
      await del(user.id)
    }
  }

  const userArray = userData?.users === undefined
    ? []
    : [...userData.users]
  const users = userArray
    .sort((a, b) => a.username.localeCompare(b.username))

  return (
    <>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {users.map((user: User) => (
          <li key={user.id}>
            {user.username} ({user.role}){ ' ' }
            <button
              onClick={() => { void confirmDeleteUser(user) }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default UserList
