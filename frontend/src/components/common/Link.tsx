import { Link as RouterLink } from 'react-router-dom'

interface Props {
  to: string
  text: string
}

export function Link (props: Props): JSX.Element {
  return (
    <RouterLink
      to={props.to}>{props.text}
    </RouterLink>
  )
}

export default Link
