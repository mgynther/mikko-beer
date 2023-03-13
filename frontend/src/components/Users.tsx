import { useListUsersQuery } from '../store/user/api'
import { User } from '../store/user/types'

function Users() {
  const { data: userData, isLoading } = useListUsersQuery();
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

export default Users;
