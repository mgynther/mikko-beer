import { useState } from 'react'

import { useCreateUserMutation } from '../store/user/api'

import LoadingIndicator from './LoadingIndicator'

import './CreateUser.css'

function CreateUser (): JSX.Element {
  const [createUser, { data, error, isLoading }] = useCreateUserMutation()

  const [isMismatch, setIsMismatch] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  async function doChange (event: any): Promise<void> {
    event.preventDefault()
    await createUser({
      passwordSignInMethod: {
        username: event.target.username.value as string,
        password: event.target.password.value as string
      },
      user: {
        role: event.target.role.value as string
      }
    })
    event.target.reset()
  }

  return (
    <div>
      <h4>Create user</h4>
      <form
        className="CreateUserForm"
        onSubmit={(e) => { void doChange(e) }}>
        <div>
          <label htmlFor='username'>Username:</label>{' '}
          <input type='text' id='username' />
        </div>
        <div>
          <label htmlFor='password'>Password:</label>{' '}
          <input
            type='password'
            id='password'
            autoComplete='new-password'
            onChange={(e) => {
              const password = e.target.value
              setIsMismatch(password !== passwordConfirmation)
              setPassword(password)
            }}
          />
        </div>
        <div>
          <label htmlFor='password'>Password confirmation:</label>{' '}
          <input
            type='password'
            id='passwordConfirmation'
            autoComplete='new-password'
            onChange={(e) => {
              const passwordConfirmation = e.target.value
              setIsMismatch(password !== passwordConfirmation)
              setPasswordConfirmation(passwordConfirmation)
            }}
          />
        </div>
        <div>
          Role:{' '}
          <select
            defaultValue={'viewer'}
            id='role'
          >
            <option value={'admin'}>Admin</option>
            <option value={'viewer'}>Viewer</option>
          </select>
        </div>
        <div>
          <input type='submit'
            value='Create'
            disabled={isLoading || isMismatch}
          />
        </div>
        <div>
          <LoadingIndicator isLoading={isLoading} />
          {!isLoading && data !== undefined && 'Created!' }
          {!isLoading && error !== undefined &&
            'Creating failed. Please check the username and passwords.' }
        </div>
      </form>
    </div>
  )
}

export default CreateUser
