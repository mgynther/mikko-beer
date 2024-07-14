import type {
  GetLogin,
  GetPasswordChangeResult,
  Login
} from '../../core/login/types'
import ChangePassword from './ChangePassword'

interface Props {
  getLogin: GetLogin
  getPasswordChangeResult: GetPasswordChangeResult
}

function Account (props: Props): JSX.Element {
  const login: Login = props.getLogin()
  return (
    <div>
      <h3>Account</h3>
      <div>Username: { login.user?.username }</div>
      <ChangePassword
        getLogin={props.getLogin}
        getPasswordChangeResult={props.getPasswordChangeResult}
      />
    </div>
  )
}

export default Account
