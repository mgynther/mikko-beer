import { Links } from '../common/Links'

import type { Brewery } from '../../core/brewery/types'

interface Props {
  breweries: Brewery[]
}

export function breweryLinkFormatter (id: string) {
  return `/breweries/${id}`
}

export function BreweryLinks (props: Props): JSX.Element {
  return (
    <Links
      items={props.breweries}
      linkFormatter={breweryLinkFormatter}
    />
  )
}

export default BreweryLinks
