import { useEffect, useState } from 'react'

import { useLazyListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'
import { infiniteScroll, toString } from './util'

import BreweryLinks from './BreweryLinks'

import './Beers.css'

const pageSize = 20

function Beers (): JSX.Element {
  const [loadedBeers, setLoadedBeers] = useState<Beer[]>([])
  const [trigger, result] = useLazyListBeersQuery()

  const isLoading = result.isLoading
  const beerData = result.data
  const beerArray = beerData?.beers === undefined
    ? []
    : [...beerData.beers]
  const hasMore = beerArray.length > 0 || result.isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        skip: loadedBeers.length,
        size: pageSize
      })
      if (result.data === undefined) return
      const newBeers = [...loadedBeers, ...result.data.beers]
      setLoadedBeers(newBeers)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [loadedBeers, setLoadedBeers, isLoading, hasMore, trigger])

  return (
    <div>
      <h3>Beers</h3>
      {isLoading && (<div>Loading...</div>)}
      <table className='BeersTable'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Breweries</th>
            <th>Styles</th>
          </tr>
        </thead>
        <tbody>
          {loadedBeers.map((beer: Beer) => (
            <tr key={beer.id}>
              <td>{beer.name}</td>
              <td>
                <BreweryLinks breweries={beer.breweries} />
              </td>
              <td>
                {toString(beer.styles.map(style => style.name).sort())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Beers
