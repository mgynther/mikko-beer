import React from 'react'

import { Role } from '../../core/user/types'
import type { GetLogin, Login } from '../../core/login/types'

import Button from './Button'

interface Props {
  disabled: boolean
  getLogin: GetLogin
  onClick: () => void
}

function EditButton (props: Props): React.JSX.Element | null {
  const login: Login = props.getLogin()
  if (login.user?.role !== Role.admin) {
    return null
  }
  return (
    <Button
      className='EditButton'
      disabled={props.disabled}
      onClick={() => { props.onClick() }}
      text='Edit'
    />
  )
}

export default EditButton
