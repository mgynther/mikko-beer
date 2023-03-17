import { useListBreweriesQuery } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

import LoadingIndicator from './LoadingIndicator'

function Breweries (): JSX.Element {
  const { data: breweryData, isLoading } = useListBreweriesQuery()
  return (
    <div>
      <h3>Breweries</h3>
      <LoadingIndicator isLoading={isLoading} />
      <ul>
        {breweryData?.breweries.map((brewery: Brewery) => (
          <li key={brewery.id}>{brewery.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Breweries
