import { Link, useNavigate } from 'react-router-dom'

import { useListBreweriesQuery } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import LoadingIndicator from './LoadingIndicator'
import SearchBrewery from './SearchBrewery'

function Breweries (): JSX.Element {
  const navigate = useNavigate()
  const { data: breweryData, isLoading } = useListBreweriesQuery()

  const breweryArray = breweryData?.breweries === undefined
    ? []
    : [...breweryData.breweries]
  const breweries = breweryArray
    .sort((a, b) => a.name.localeCompare(b.name))

  function toRoute (brewery: Brewery): string {
    return `/breweries/${brewery.id}`
  }

  return (
    <div>
      <h3>Breweries</h3>
      <LoadingIndicator isLoading={isLoading} />
      <SearchBrewery select={(brewery) => {
        navigate(toRoute(brewery))
      }} />
      <ul>
        {breweries?.map((brewery: Brewery) => (
          <li key={brewery.id}>
            <Link to={toRoute(brewery)}>
              {brewery.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Breweries
