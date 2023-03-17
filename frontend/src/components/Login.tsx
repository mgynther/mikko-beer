import { useLoginMutation } from '../store/login/api'

import LoadingIndicator from './LoadingIndicator'

function Login (): JSX.Element {
  const [login, { isLoading }] = useLoginMutation()

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
          <label htmlFor='username'>Username:</label>{' '}
          <input type='text' id='username' />
        </div>
        <div>
          <label htmlFor='password'>Password:</label>{' '}
          <input type='password' id='password' />
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
