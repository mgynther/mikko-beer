import { useEffect, useState } from 'react'

import { formatTitle, invertDirection } from '../list-helpers'
import { useLazyGetBreweryStatsQuery } from '../../store/stats/api'
import {
  type BreweryStatsSortingOrder,
  type OneBreweryStats
} from '../../store/stats/types'
import { type ListDirection, type Pagination } from '../../store/types'
import { infiniteScroll } from '../util'

import BreweryLinks from '../brewery/BreweryLinks'
import LoadingIndicator from '../common/LoadingIndicator'
import TabButton from '../common/TabButton'

import MinimumReviewCount from './MinimumReviewCount'

import './Stats.css'

const pageSize = 30

interface Props {
  breweryId: string | undefined
}

interface TriggerParams {
  breweryId: string | undefined
  pagination: Pagination
  minReviewCount: number
}

const giantPage = {
  skip: 0,
  size: 10000
}

function Brewery (props: Props): JSX.Element {
  const [
    sortingOrder,
    setSortingOrder
  ] = useState<BreweryStatsSortingOrder>('brewery_name')
  const [
    sortingDirection,
    setSortingDirection
  ] = useState<ListDirection>('asc')
  const [minReviewCount, doSetMinReviewCount] = useState(1)
  const [trigger, { data: breweryData, isLoading }] =
    useLazyGetBreweryStatsQuery()
  const [loadedBreweries, setLoadedBreweries] =
    useState<OneBreweryStats[] | undefined>(undefined)
  const breweryId = props.breweryId
  const [breweryIdTriggerParams, setBreweryIdTriggerParams] =
  useState<TriggerParams>({
    breweryId,
    pagination: giantPage,
    minReviewCount
  })

  function setMinReviewCount (minReviewCount: number): void {
    doSetMinReviewCount(minReviewCount)
    setLoadedBreweries(undefined)
  }

  useEffect(() => {
    setBreweryIdTriggerParams({
      breweryId,
      pagination: giantPage,
      minReviewCount
    })
  }, [breweryId, minReviewCount])

  const breweryArray = breweryData?.brewery === undefined
    ? []
    : [...breweryData.brewery]
  const hasMore = breweryArray.length > 0 || loadedBreweries === undefined

  useEffect(() => {
    if (breweryId === undefined) {
      return
    }
    async function loadAll (): Promise<void> {
      const result = await trigger({
        ...breweryIdTriggerParams,
        sorting: {
          order: sortingOrder,
          direction: sortingDirection
        },
        minReviewCount
      })
      if (result?.data === undefined) return
      setLoadedBreweries([...result.data.brewery])
    }
    void loadAll()
  }, [
    sortingOrder,
    sortingDirection,
    breweryIdTriggerParams,
    minReviewCount,
    loadedBreweries
  ])

  useEffect(() => {
    if (breweryId !== undefined) {
      return
    }
    const loadMore = async (): Promise<void> => {
      const result = await trigger({
        breweryId: props.breweryId,
        pagination: {
          skip: loadedBreweries?.length ?? 0,
          size: pageSize
        },
        sorting: {
          order: sortingOrder,
          direction: sortingDirection
        },
        minReviewCount
      })
      if (result.data === undefined) return
      const newBreweries = [...(loadedBreweries ?? []), ...result.data.brewery]
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
    minReviewCount,
    sortingOrder,
    sortingDirection,
    trigger
  ])

  function isSelected (property: BreweryStatsSortingOrder): boolean {
    return sortingOrder === property
  }

  function createClickHandler (property: BreweryStatsSortingOrder): () => void {
    return () => {
      setLoadedBreweries(undefined)
      if (isSelected(property)) {
        setSortingDirection(invertDirection(sortingDirection))
        return
      }
      setSortingOrder(property)
      setSortingDirection(property === 'brewery_name' ? 'asc' : 'desc')
    }
  }

  return (
    <div>
      <LoadingIndicator isLoading={isLoading} />
      <table className='StatsTable SortableStats'>
        <thead>
          <tr>
            <th className='StatsNameColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('brewery_name')}
                title={formatTitle(
                  'Brewery',
                  isSelected('brewery_name'),
                  sortingDirection
                )}
                onClick={createClickHandler('brewery_name')} />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('count')}
                title={formatTitle(
                  'Reviews',
                  isSelected('count'),
                  sortingDirection
                )}
                onClick={createClickHandler('count')} />
            </th>
            <th className='StatsNumColumn'>
              <TabButton
                isCompact={false}
                isSelected={isSelected('average')}
                title={formatTitle(
                  'Average',
                  isSelected('average'),
                  sortingDirection
                )}
                onClick={createClickHandler('average')} />
            </th>
          </tr>
          <tr>
            <th colSpan={3}>
              <MinimumReviewCount
                minReviewCount={minReviewCount}
                setMinReviewCount={setMinReviewCount}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {loadedBreweries?.map(brewery => (
            <tr key={brewery.breweryId}>
              <td className='StatsNameColumn'>
                <BreweryLinks breweries={[{
                  id: brewery.breweryId,
                  name: brewery.breweryName
                }]} />
              </td>
              <td className='StatsNumColumn'>{brewery.reviewCount}</td>
              <td className='StatsNumColumn'>{brewery.reviewAverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Brewery
