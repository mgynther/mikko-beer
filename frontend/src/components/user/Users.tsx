import {
  type User,
  UserIf
} from '../../core/user/types'

import LoadingIndicator from '../common/LoadingIndicator'

import CreateUser from './CreateUser'

interface Props {
  userIf: UserIf
}

function Users (props: Props): JSX.Element {
  const { data: userData, isLoading } = props.userIf.list.useList()
  const { delete: del } = props.userIf.delete.useDelete()

  async function confirmDeleteUser (user: User): Promise<void> {
    if (confirm(`Are you sure you want to delete "${user.username}"?`)) {
      await del(user.id)
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
        <CreateUser createUserIf={props.userIf.create}/>
      </div>
    </div>
  )
}

export default Users
