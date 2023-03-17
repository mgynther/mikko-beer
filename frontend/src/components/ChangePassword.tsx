import { useSelector } from 'react-redux'

import { useChangePasswordMutation } from '../store/login/api'
import {
  type Login,
  PasswordChangeResult,
  selectLogin,
  selectPasswordChangeResult
} from '../store/login/reducer'

import LoadingIndicator from './LoadingIndicator'

import './ChangePassword.css'

function ChangePassword (): JSX.Element {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const login: Login = useSelector(selectLogin)
  const passwordChangeResult: PasswordChangeResult =
    useSelector(selectPasswordChangeResult)

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
          <label htmlFor='password'>Old password:</label>{' '}
          <input type='password' id='oldPassword' />
        </div>
        <div>
          <label htmlFor='password'>New password:</label>{' '}
          <input
            type='password'
            id='newPassword'
            autoComplete='new-password'
          />
        </div>
        <div>
          <input type='submit'
            value='Change'
            disabled={isLoading}
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
