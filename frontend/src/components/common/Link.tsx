import React from 'react'

import { Link as RouterLink } from 'react-router'

interface Props {
  to: string
  text: string
}

export function Link (props: Props): React.JSX.Element {
  return (
    <RouterLink
      to={props.to}>{props.text}
    </RouterLink>
  )
}

export default Link
