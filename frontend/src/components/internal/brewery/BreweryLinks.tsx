import React from 'react'

import { Links } from '../common/Links'
import type { LinkComponent } from '../../common/link'

import type { BreweryBasics } from '../../types/brewery/types'

interface Props {
  breweries: BreweryBasics[]
  linkComponent: LinkComponent
}

export function breweryLinkFormatter(id: string): string {
  return `/breweries/${id}`
}

export function BreweryLinks(props: Props): React.JSX.Element {
  return (
    <Links
      items={props.breweries}
      linkComponent={props.linkComponent}
      linkFormatter={breweryLinkFormatter}
    />
  )
}

export default BreweryLinks
