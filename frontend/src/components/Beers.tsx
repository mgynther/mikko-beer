import { useListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'

function Beers (): JSX.Element {
  const { data: beerData, isLoading } = useListBeersQuery()
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

export default Beers
