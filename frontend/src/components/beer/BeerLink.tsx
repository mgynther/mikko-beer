import React from 'react'

import { Link } from '../common/Link'

interface BasicBeer {
  id: string
  name: string
}

interface Props {
  beer: BasicBeer
}

export function BeerLink (props: Props): React.JSX.Element {
  return (
    <Link
      to={`/beers/${props.beer.id}`}
      text={props.beer.name}
    />
  )
}

export default BeerLink
