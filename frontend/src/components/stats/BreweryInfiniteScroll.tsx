import React, { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
} from '../../core/stats/types'

import BreweryStatsTable from './BreweryStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'

const pageSize = 30

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
  statsParams: FormattedStatsParams<BreweryStatsSortingOrder>
  loadedBreweries: OneBreweryStats[] | undefined
  setLoadedBreweries: (breweries: OneBreweryStats[] | undefined) => void
}

function BreweryInfiniteScroll(props: Props): React.JSX.Element {
  const {
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    sortingDirection,
    sortingOrder,
    timeStart,
    timeEnd,
  } = props.statsParams
  const {
    isFilterChangePending,
    loadedBreweries,
    setLoadedBreweries,
    setSortingOrder,
  } = props
  const {
    query,
    stats,
    isLoading: isLoadingStats,
  } = props.getBreweryStatsIf.useStats()
  const isLoading = isFilterChangePending || isLoadingStats

  const lastPageArray = stats?.brewery === undefined ? [] : [...stats.brewery]
  const hasMore = lastPageArray.length > 0 || loadedBreweries === undefined

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: undefined,
        locationId: undefined,
        styleId: undefined,
        pagination: {
          skip: loadedBreweries?.length ?? 0,
          size: pageSize,
        },
        sorting: {
          order: sortingOrder,
          direction: sortingDirection,
        },
        minReviewCount,
        maxReviewCount,
        minReviewAverage,
        maxReviewAverage,
        timeStart,
        timeEnd,
      })
      const newBreweries = [...(loadedBreweries ?? []), ...result.brewery]
      setLoadedBreweries(newBreweries)
    }
    function checkLoad(): void {
      if (isLoading) {
        return
      }
      if (!hasMore) {
        return
      }
      void loadMore()
    }
    return props.getBreweryStatsIf.infiniteScroll(checkLoad)
  }, [
    isLoading,
    hasMore,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    sortingOrder,
    sortingDirection,
    query,
    timeStart,
    timeEnd,
  ])

  return (
    <BreweryStatsTable
      breweries={loadedBreweries ?? []}
      filterState={props.filterState}
      isLoading={loadedBreweries === undefined}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryInfiniteScroll
