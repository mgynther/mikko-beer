import { useListBreweriesQuery } from '../store/brewery/api'
import { type Brewery } from '../store/brewery/types'

function Breweries (): JSX.Element {
  const { data: breweryData, isLoading } = useListBreweriesQuery()
  return (
    <div>
      <h3>Breweries</h3>
      {isLoading && (<div>Loading...</div>)}
      <ul>
        {breweryData?.breweries.map((brewery: Brewery) => (
          <li key={brewery.id}>{brewery.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Breweries
