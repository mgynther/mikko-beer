import { useEffect, useState } from 'react'

import { useLazyGetBreweryStatsQuery } from '../../store/stats/api'
import { type OneBreweryStats } from '../../store/stats/types'
import { type Pagination } from '../../store/types'
import { infiniteScroll } from '../util'

import LoadingIndicator from '../common/LoadingIndicator'

import './Brewery.css'
import './Stats.css'

const pageSize = 30

interface Props {
  breweryId: string | undefined
}

interface TriggerParams {
  breweryId: string | undefined
  pagination: Pagination
}

function Brewery (props: Props): JSX.Element {
  const [trigger, { data: breweryData, isLoading, isUninitialized }] =
    useLazyGetBreweryStatsQuery()
  const [loadedBreweries, setLoadedBreweries] = useState<OneBreweryStats[]>([])
  const [breweryIdTriggerParams] = useState<TriggerParams>({
    breweryId: props.breweryId,
    pagination: {
      skip: 0,
      size: 10000
    }
  })

  const breweryArray = breweryData?.brewery === undefined
    ? []
    : [...breweryData.brewery]
  const hasMore = breweryArray.length > 0 || isUninitialized

  const breweryId = props.breweryId

  useEffect(() => {
    if (breweryId === undefined) {
      return
    }
    async function loadAll (): Promise<void> {
      const result = await trigger(breweryIdTriggerParams)
      if (result?.data === undefined) return
      setLoadedBreweries([...result.data.brewery])
    }
    void loadAll()
  }, [])

  useEffect(() => {
    if (breweryId !== undefined) {
      return
    }
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        breweryId: props.breweryId,
        pagination: {
          skip: loadedBreweries.length,
          size: pageSize
        }
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
  }, [
    breweryId,
    loadedBreweries,
    setLoadedBreweries,
    isLoading,
    hasMore,
    trigger
  ])

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
