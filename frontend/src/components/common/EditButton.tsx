import React from 'react'

import { Role } from '../../core/user/types'
import type { GetLogin, Login } from '../../core/login/types'

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
    <button
      className='EditButton'
      disabled={props.disabled}
      onClick={() => { props.onClick() }}
    >
      Edit
    </button>
  )
}

export default EditButton
