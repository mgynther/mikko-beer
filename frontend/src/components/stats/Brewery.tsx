import { useEffect, useState } from 'react'

import { useLazyGetBreweryStatsQuery } from '../../store/stats/api'
import { type OneBreweryStats } from '../../store/stats/types'
import { infiniteScroll } from '../util'

import LoadingIndicator from '../LoadingIndicator'

import './Brewery.css'
import './Stats.css'

const pageSize = 30

function Brewery (): JSX.Element {
  const [trigger, { data: breweryData, isLoading, isUninitialized }] =
    useLazyGetBreweryStatsQuery()
  const [loadedBreweries, setLoadedBreweries] = useState<OneBreweryStats[]>([])

  const breweryArray = breweryData?.brewery === undefined
    ? []
    : [...breweryData.brewery]
  const hasMore = breweryArray.length > 0 || isUninitialized

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        skip: loadedBreweries.length,
        size: pageSize
      })
      if (result.data === undefined) return
      const newBreweries = [...loadedBreweries, ...result.data.brewery]
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
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable'>
        <thead>
          <tr>
            <th className='BreweryNameColumn'>Brewery</th>
            <th className='BreweryNumColumn'>Reviews</th>
            <th className='BreweryNumColumn'>Review rating average</th>
          </tr>
        </thead>
        <tbody>
          {loadedBreweries.map(brewery => (
            <tr key={brewery.breweryId}>
              <td className='BreweryNameColumn'>{brewery.breweryName}</td>
              <td className='BreweryNumColumn'>{brewery.reviewCount}</td>
              <td className='BreweryNumColumn'>{brewery.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Brewery
