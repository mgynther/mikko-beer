import React, { type SubmitEvent, useState } from 'react'

import LoadingIndicator from '../common/LoadingIndicator'

import './CreateUser.css'
import type { CreateUserIf } from '../../core/user/types'

interface Props {
  createUserIf: CreateUserIf
}

function CreateUser (props: Props): React.JSX.Element {
  const {create, user, hasError, isLoading } = props.createUserIf.useCreate()

  const [isMismatch, setIsMismatch] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  async function doChange (event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    await create({
      passwordSignInMethod: {
        username,
        password
      },
      user: {
        role
      }
    })
    setUsername('')
    setPassword('')
    setRole('viewer')
    setPasswordConfirmation('')
  }

  return (
    <div>
      <h4>Create user</h4>
      <form
        className="CreateUserForm"
        onSubmit={(e) => { void doChange(e) }}>
        <div>
          <input
            type='text'
            placeholder='Username'
            id='username'
            onChange={(e) => {
              setUsername(e.target.value)
            }}
          />
        </div>
        <div>
          <input
            type='password'
            placeholder='Password'
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
          <input
            type='password'
            placeholder='Password confirmation'
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
          <div>Role:</div>
          <select
            value={role}
            id='role'
            onChange={(e) => {
              setRole(e.target.value)
            }}
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
          {!isLoading && user !== undefined && 'Created!' }
          {!isLoading && hasError &&
            'Creating failed. Please check the username and passwords.' }
        </div>
      </form>
    </div>
  )
}

export default CreateUser
