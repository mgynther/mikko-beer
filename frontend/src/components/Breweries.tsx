import { useListBreweriesQuery } from '../store/brewery/api'
import { Brewery } from '../store/brewery/types'

function Breweries() {
  const { data: breweryData, isLoading } = useListBreweriesQuery();
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

export default Breweries;
