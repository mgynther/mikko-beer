import React, { type SubmitEvent, useState } from 'react'

import type { LoginIf } from '../../core/login/types'

import LoadingIndicator from '../common/LoadingIndicator'

interface Props {
  loginIf: LoginIf
}

function Login (props: Props): React.JSX.Element {
  const { login, isLoading } = props.loginIf.useLogin()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function doLogin (event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    await login({
      username,
      password
    })
    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <form onSubmit={(e) => { void doLogin(e) }}>
        <h3>Login</h3>
        <div>
          <input
            type='text'
            placeholder='Username'
            id='username'
            value={username}
            onChange={(e) => { setUsername(e.target.value); }}
          />
        </div>
        <div>
          <input
            type='password'
            placeholder='Password'
            id='password'
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
          />
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
