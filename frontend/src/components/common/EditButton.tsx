import { useSelector } from '../../react-redux-wrapper'

import { type Login, selectLogin } from '../../store/login/reducer'
import { Role } from '../../core/user/types'

interface Props {
  disabled: boolean
  onClick: () => void
}

function EditButton (props: Props): JSX.Element | null {
  const login: Login = useSelector(selectLogin)
  if (login?.user?.role !== Role.admin) {
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
