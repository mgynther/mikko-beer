import React from 'react'

import type { LinkComponent } from '../../common/link'

interface BasicStyle {
  id: string
  name: string
}

interface Props {
  style: BasicStyle
  linkComponent: LinkComponent
}

export function StyleLink(props: Props): React.JSX.Element {
  const Link = props.linkComponent
  return <Link to={`/styles/${props.style.id}`} text={props.style.name} />
}

export default StyleLink
