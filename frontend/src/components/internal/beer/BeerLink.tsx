import React from 'react'

import type { LinkComponent } from '../../common/link'

interface BasicBeer {
  id: string
  name: string
}

interface Props {
  beer: BasicBeer
  linkComponent: LinkComponent
}

export function BeerLink(props: Props): React.JSX.Element {
  const Link = props.linkComponent
  return <Link to={`/beers/${props.beer.id}`} text={props.beer.name} />
}

export default BeerLink
