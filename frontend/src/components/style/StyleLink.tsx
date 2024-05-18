import { Link } from 'react-router-dom'

interface BasicStyle {
  id: string
  name: string
}

interface Props {
  style: BasicStyle
}

export function StyleLink (props: Props): JSX.Element {
  return (
    <Link to={`/styles/${props.style.id}`}>
      {props.style.name}
    </Link>
  )
}

export default StyleLink
