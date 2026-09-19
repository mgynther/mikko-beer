import React from 'react'

import type { UserIf } from '../types/user/types'

import { confirmDialog } from '../internal/confirm'
import CreateUser from '../internal/user/CreateUser'
import UserList from '../internal/user/UserList'

interface Props {
  userIf: UserIf
}

function Users(props: Props): React.JSX.Element {
  return (
    <div>
      <h3>Users</h3>
      <UserList
        confirm={confirmDialog}
        deleteUserIf={props.userIf.delete}
        listUsersIf={props.userIf.list}
      />
      <hr />
      <div>
        <CreateUser createUserIf={props.userIf.create} />
      </div>
    </div>
  )
}

export default Users
