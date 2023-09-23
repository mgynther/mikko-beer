import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useLazyListBreweriesQuery } from '../../store/brewery/api'
import { type Brewery } from '../../store/brewery/types'

import { infiniteScroll } from '../util'

import LoadingIndicator from '../common/LoadingIndicator'

import SearchBreweryWithNavi from './SearchBreweryWithNavi'

const pageSize = 20

function Breweries (): JSX.Element {
  const [loadedBreweries, setLoadedBreweries] = useState<Brewery[]>([])
  const [trigger, result] = useLazyListBreweriesQuery()
  const isLoading = result.isLoading

  const breweryData = result.data
  const breweryArray = breweryData?.breweries === undefined
    ? []
    : [...breweryData.breweries]

  function toRoute (brewery: Brewery): string {
    return `/breweries/${brewery.id}`
  }

  const hasMore = breweryArray.length > 0 || result.isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        skip: loadedBreweries.length,
        size: pageSize
      })
      if (result.data === undefined) return
      const newBreweries = [...loadedBreweries, ...result.data.breweries]
      setLoadedBreweries(newBreweries)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [loadedBreweries, setLoadedBreweries, isLoading, hasMore, trigger])

  return (
    <div>
      <h3>Breweries</h3>
      <LoadingIndicator isLoading={isLoading} />
      <SearchBreweryWithNavi />
      <ul>
        {loadedBreweries.map((brewery: Brewery) => (
          <li key={brewery.id}>
            <Link to={toRoute(brewery)}>
              {brewery.name}
            </Link>
          </li>
        ))}
      </ul>
      <LoadingIndicator isLoading={isLoading} />
    </div>
  )
}

export default Breweries
