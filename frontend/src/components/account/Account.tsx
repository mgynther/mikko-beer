import type { GetLogin, Login } from '../../core/login/types'
import ChangePassword from './ChangePassword'

interface Props {
  getLogin: GetLogin
}

function Account (props: Props): JSX.Element {
  const login: Login = props.getLogin()
  return (
    <div>
      <h3>Account</h3>
      <div>Username: { login.user?.username }</div>
      <ChangePassword getLogin={props.getLogin} />
    </div>
  )
}

export default Account
