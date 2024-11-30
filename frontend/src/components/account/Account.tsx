import React from 'react'

import type {
  ChangePasswordIf,
  GetLogin,
  Login
} from '../../core/login/types'
import ChangePassword from './ChangePassword'

interface Props {
  changePasswordIf: ChangePasswordIf
  getLogin: GetLogin
}

function Account (props: Props): React.JSX.Element {
  const login: Login = props.getLogin()
  return (
    <div>
      <h3>Account</h3>
      <div>Username: { login.user?.username }</div>
      <ChangePassword
        getLogin={props.getLogin}
        changePasswordIf={props.changePasswordIf}
      />
    </div>
  )
}

export default Account
