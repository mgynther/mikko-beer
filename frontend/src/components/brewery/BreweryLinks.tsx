import React from 'react'

import { Links } from '../common/Links'

import type { Brewery } from '../../core/brewery/types'

interface Props {
  breweries: Brewery[]
}

export function breweryLinkFormatter (id: string): string {
  return `/breweries/${id}`
}

export function BreweryLinks (props: Props): React.JSX.Element {
  return (
    <Links
      items={props.breweries}
      linkFormatter={breweryLinkFormatter}
    />
  )
}

export default BreweryLinks
