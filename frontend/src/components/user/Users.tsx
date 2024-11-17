import { UserIf } from '../../core/user/types'

import CreateUser from './CreateUser'
import UserList from './UserList'

interface Props {
  userIf: UserIf
}

function Users (props: Props): JSX.Element {
  return (
    <div>
      <h3>Users</h3>
      <UserList
        getConfirm={() => confirm}
        deleteUserIf={props.userIf.delete}
        listUsersIf={props.userIf.list}
      />
      <hr/>
      <div>
        <CreateUser createUserIf={props.userIf.create}/>
      </div>
    </div>
  )
}

export default Users
