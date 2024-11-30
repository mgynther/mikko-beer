import React from 'react'

import { Links } from '../common/Links'

import type { Style } from '../../core/style/types'

interface Props {
  styles: Style[]
}

export function StyleLinks (props: Props): React.JSX.Element {
  return (
    <Links
      items={props.styles}
      linkFormatter={(id) => `/styles/${id}`}
    />
  )
}

export default StyleLinks
