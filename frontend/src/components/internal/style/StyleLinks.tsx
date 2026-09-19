import React from 'react'

import { Links } from '../common/Links'
import type { LinkComponent } from '../../common/link'

import type { Style } from '../../types/style/types'

interface Props {
  styles: Style[]
  linkComponent: LinkComponent
}

export function StyleLinks(props: Props): React.JSX.Element {
  return (
    <Links
      items={props.styles}
      linkComponent={props.linkComponent}
      linkFormatter={(id) => `/styles/${id}`}
    />
  )
}

export default StyleLinks
