import { Link } from 'react-router-dom'

interface BasicBeer {
  id: string
  name: string
}

interface Props {
  beer: BasicBeer
}

export function BeerLink (props: Props): JSX.Element {
  return (
    <Link to={`/beers/${props.beer.id}`}>
      {props.beer.name}
    </Link>
  )
}

export default BeerLink
