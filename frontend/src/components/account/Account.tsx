import { useSelector } from '../../react-redux-wrapper'

import { type Login, selectLogin } from '../../store/login/reducer'

import ChangePassword from './ChangePassword'

function Account (): JSX.Element {
  const login: Login = useSelector(selectLogin)
  return (
    <div>
      <h3>Account</h3>
      <div>Username: { login.user?.username }</div>
      <ChangePassword />
    </div>
  )
}

export default Account
