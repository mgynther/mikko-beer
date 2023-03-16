import { useListBeersQuery } from '../store/beer/api'
import { useListBreweriesQuery } from '../store/brewery/api'
import { useListStylesQuery } from '../store/style/api'
import { type Beer } from '../store/beer/types'
import { toBreweryMap } from '../store/brewery/util'
import { toStyleMap } from '../store/style/util'
import { toString } from './util'

function Beers (): JSX.Element {
  const { data: beerData, isLoading: areBeersLoading } = useListBeersQuery()
  const { data: breweryData, isLoading: areBreweriesLoading } =
    useListBreweriesQuery()
  const breweryMap = toBreweryMap(breweryData)
  const { data: styleData, isLoading: areStylesLoading } =
    useListStylesQuery()
  const styleMap = toStyleMap(styleData)
  const isLoading = areBeersLoading || areBreweriesLoading || areStylesLoading
  return (
    <div>
      <h3>Beers</h3>
      {isLoading && (<div>Loading...</div>)}
      <table>
        <thead>
          <tr>
            <th>Breweries</th>
            <th>Name</th>
            <th>Styles</th>
          </tr>
        </thead>
        <tbody>
          {beerData?.beers.map((beer: Beer) => (
            <tr key={beer.id}>
              <td>
                {toString(beer.breweries.map(b => breweryMap[b].name))}
              </td>
              <td>{beer.name}</td>
              <td>
                {toString(beer.styles.map(s => styleMap[s].name))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Beers
