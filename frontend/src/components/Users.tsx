import { useListUsersQuery } from '../store/user/api'
import { type User } from '../store/user/types'

import LoadingIndicator from './LoadingIndicator'

function Users (): JSX.Element {
  const { data: userData, isLoading } = useListUsersQuery()
  return (
    <div>
      <h3>Users</h3>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {userData?.users.map((user: User) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  )
}

export default Users
