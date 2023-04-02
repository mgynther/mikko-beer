import { useListBeersQuery } from '../store/beer/api'
import { useListBreweriesQuery } from '../store/brewery/api'
import { useListStylesQuery } from '../store/style/api'
import { type Beer } from '../store/beer/types'
import { toBreweryMap } from '../store/brewery/util'
import { toStyleMap } from '../store/style/util'
import { toString } from './util'

interface BeerModel {
  id: string
  breweries: string
  name: string
  styles: string
}

function Beers (): JSX.Element {
  const { data: beerData, isLoading: areBeersLoading } = useListBeersQuery()
  const { data: breweryData, isLoading: areBreweriesLoading } =
    useListBreweriesQuery()
  const breweryMap = toBreweryMap(breweryData)
  const { data: styleData, isLoading: areStylesLoading } =
    useListStylesQuery()
  const styleMap = toStyleMap(styleData)
  const isLoading = areBeersLoading || areBreweriesLoading || areStylesLoading

  const beers = beerData?.beers
    .map((beer: Beer) => (
      {
        id: beer.id,
        breweries: toString(beer.breweries.map(b => breweryMap[b].name)),
        name: beer.name,
        styles: toString(beer.styles.map(s => styleMap[s].name))
      }
    ))
    .sort((a: BeerModel, b: BeerModel) => {
      if (a.breweries === b.breweries) {
        return a.name.localeCompare(b.name)
      }
      return a.breweries.localeCompare(b.breweries)
    })

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
          {beers?.map((beer: BeerModel) => (
            <tr key={beer.id}>
              <td>
                {beer.breweries}
              </td>
              <td>{beer.name}</td>
              <td>
                {beer.styles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Beers
