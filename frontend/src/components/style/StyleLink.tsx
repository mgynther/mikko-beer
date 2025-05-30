import React from 'react'

import { Link } from '../common/Link'

interface BasicStyle {
  id: string
  name: string
}

interface Props {
  style: BasicStyle
}

export function StyleLink (props: Props): React.JSX.Element {
  return (
    <Link
      to={`/styles/${props.style.id}`}
      text={props.style.name}
    />
  )
}

export default StyleLink
