import { useListBreweriesQuery } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import LoadingIndicator from './LoadingIndicator'

function Breweries (): JSX.Element {
  const { data: breweryData, isLoading } = useListBreweriesQuery()

  const breweryArray = breweryData?.breweries === undefined
    ? []
    : [...breweryData.breweries]
  const breweries = breweryArray
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <h3>Breweries</h3>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {breweries?.map((brewery: Brewery) => (
          <li key={brewery.id}>{brewery.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Breweries
