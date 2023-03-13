import { useListBeersQuery } from '../store/beer/api'
import { Beer } from '../store/beer/types'

function Beers() {
  const { data: beerData, isLoading } = useListBeersQuery();
  return (
    <div>
      <h3>Beers</h3>
      {isLoading && (<div>Loading...</div>)}
      <ul>
        {beerData?.beers.map((beer: Beer) => (
          <li key={beer.id}>{beer.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Beers;
