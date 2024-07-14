import { useDeleteUserMutation, useListUsersQuery } from '../../store/user/api'
import { type User } from '../../core/user/types'

import LoadingIndicator from '../common/LoadingIndicator'

import CreateUser from './CreateUser'

function Users (): JSX.Element {
  const { data: userData, isLoading } = useListUsersQuery()
  const [deleteUser] = useDeleteUserMutation()

  async function confirmDeleteUser (user: User): Promise<void> {
    if (confirm(`Are you sure you want to delete "${user.username}"?`)) {
      await deleteUser(user.id)
    }
  }

  const userArray = userData?.users === undefined
    ? []
    : [...userData.users]
  const users = userArray
    .sort((a, b) => a.username.localeCompare(b.username))

  return (
    <div>
      <h3>Users</h3>
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
      <hr/>
      <div>
        <CreateUser />
      </div>
    </div>
  )
}

export default Users
