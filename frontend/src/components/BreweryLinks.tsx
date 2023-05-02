import { Link } from 'react-router-dom'

import { type Brewery } from '../store/brewery/types'

interface Props {
  breweries: Brewery[]
}

export function BreweryLinks (props: Props): JSX.Element {
  return (
    <>
    {[...props.breweries]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((brewery, index) => (
        <span key={brewery.id}>
          <Link
            to={`/breweries/${brewery.id}`}>{brewery.name}
          </Link>
          {index < props.breweries.length - 1 ? ', ' : ''}
        </span>
      ))
    }
    </>
  )
}

export default BreweryLinks
