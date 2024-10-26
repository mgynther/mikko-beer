import { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
  StatsFilters
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'
import { infiniteScroll } from '../util'

import BreweryStatsTable from './BreweryStatsTable'

const pageSize = 30

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  filters: StatsFilters
  sortingDirection: ListDirection
  sortingOrder: BreweryStatsSortingOrder
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
  loadedBreweries: OneBreweryStats[] | undefined
  setLoadedBreweries: (breweries: OneBreweryStats[] | undefined) => void
}

function BreweryInfiniteScroll (props: Props): JSX.Element {
  const minReviewCount = props.filters.minReviewCount.value
  const maxReviewCount = props.filters.maxReviewCount.value
  const minReviewAverage = props.filters.minReviewAverage.value
  const maxReviewAverage = props.filters.maxReviewAverage.value
  const {
    loadedBreweries,
    setLoadedBreweries,
    sortingOrder,
    setSortingOrder,
    sortingDirection
  } = props
  const { query, stats, isLoading } = props.getBreweryStatsIf.useStats()

  const lastPageArray = stats?.brewery === undefined
    ? []
    : [...stats.brewery]
  const hasMore = lastPageArray.length > 0 || loadedBreweries === undefined

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: undefined,
        styleId: undefined,
        pagination: {
          skip: loadedBreweries?.length ?? 0,
          size: pageSize
        },
        sorting: {
          order: sortingOrder,
          direction: sortingDirection
        },
        minReviewCount,
        maxReviewCount,
        minReviewAverage,
        maxReviewAverage
      })
      if (result === undefined) return
      const newBreweries = [...(loadedBreweries ?? []), ...result.brewery]
      setLoadedBreweries(newBreweries)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return infiniteScroll(checkLoad)
  }, [
    loadedBreweries,
    setLoadedBreweries,
    isLoading,
    hasMore,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    sortingOrder,
    sortingDirection,
    query
  ])

  return (
    <BreweryStatsTable
      breweries={loadedBreweries ?? []}
      filters={props.filters}
      isLoading={isLoading}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryInfiniteScroll
