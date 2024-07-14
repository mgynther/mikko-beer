import type { LoginIf } from '../../core/login/types'

import LoadingIndicator from '../common/LoadingIndicator'

interface Props {
  loginIf: LoginIf
}

function Login (props: Props): JSX.Element {
  const { login, isLoading } = props.loginIf.useLogin()

  async function doLogin (event: any): Promise<void> {
    event.preventDefault()
    await login({
      username: event.target.username.value,
      password: event.target.password.value
    })
    event.target.reset()
  }

  return (
    <div>
      <form onSubmit={(e) => { void doLogin(e) }}>
        <h3>Login</h3>
        <div>
          <input type='text' placeholder='Username' id='username' />
        </div>
        <div>
          <input type='password' placeholder='Password' id='password' />
        </div>

        <br />

        <div>
          <input type='submit'
            value='Login'
            disabled={isLoading}
          />
          <LoadingIndicator isLoading={isLoading} />
        </div>
      </form>
    </div>
  )
}

export default Login
