import { useListUsersQuery } from '../store/user/api'
import { type User } from '../store/user/types'

function Users (): JSX.Element {
  const { data: userData, isLoading } = useListUsersQuery()
  return (
    <div>
      <h3>Users</h3>
      {isLoading && (<div>Loading...</div>)}
      <ul>
        {userData?.users.map((user: User) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  )
}

export default Users
