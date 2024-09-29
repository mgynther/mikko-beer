import { Links } from '../common/Links'

import type { Brewery } from '../../core/brewery/types'

interface Props {
  breweries: Brewery[]
}

export function BreweryLinks (props: Props): JSX.Element {
  return (
    <Links
      items={props.breweries}
      linkFormatter={(id) => `/breweries/${id}`}
    />
  )
}

export default BreweryLinks
