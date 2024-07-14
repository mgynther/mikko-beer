import { useState } from 'react'

import LoadingIndicator from '../common/LoadingIndicator'

import './ChangePassword.css'
import {
  type ChangePasswordIf,
  type GetLogin,
  type Login,
  PasswordChangeResult
} from '../../core/login/types'

interface Props {
  getLogin: GetLogin
  changePasswordIf: ChangePasswordIf
}

function ChangePassword (props: Props): JSX.Element {
  const login: Login = props.getLogin()
  const { changePassword, isLoading } =
    props.changePasswordIf.useChangePassword()
  const passwordChangeResult: PasswordChangeResult =
    props.changePasswordIf.useGetPasswordChangeResult().getResult()

  const [isMismatch, setIsMismatch] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')

  async function doChange (event: any): Promise<void> {
    event.preventDefault()
    await changePassword({
      userId: login.user?.id ?? '',
      body: {
        oldPassword: event.target.oldPassword.value as string,
        newPassword: event.target.newPassword.value as string
      }
    })
    event.target.reset()
  }

  function formatPasswordChangeResult (
    passwordChangeResult: PasswordChangeResult
  ): string | null {
    if (passwordChangeResult === PasswordChangeResult.UNDEFINED) {
      return null
    }
    if (passwordChangeResult === PasswordChangeResult.SUCCESS) {
      return 'Password changed!'
    }
    return 'Change failed. Please check your old and new passwords.'
  }

  return (
    <div>
      <h4>Change password</h4>
      <form
        className="ChangePasswordForm"
        onSubmit={(e) => { void doChange(e) }}>
        <div>
          <input type='password' placeholder='Old password' id='oldPassword' />
        </div>
        <div>
          <input
            type='password'
            placeholder='New password'
            id='newPassword'
            autoComplete='new-password'
            onChange={(e) => {
              const newPassword = e.target.value
              setIsMismatch(newPassword !== newPasswordConfirmation)
              setNewPassword(newPassword)
            }}
          />
        </div>
        <div>
          <input
            type='password'
            placeholder='New password confirmation'
            id='newPasswordConfirmation'
            autoComplete='new-password'
            onChange={(e) => {
              const newPasswordConfirmation = e.target.value
              setIsMismatch(newPassword !== newPasswordConfirmation)
              setNewPasswordConfirmation(newPasswordConfirmation)
            }}
          />
        </div>
        <div>
          <input type='submit'
            value='Change'
            disabled={isLoading || isMismatch}
          />
        </div>
        <div>
          <LoadingIndicator isLoading={isLoading} />
          {!isLoading && formatPasswordChangeResult(passwordChangeResult) }
        </div>
      </form>
    </div>
  )
}

export default ChangePassword
