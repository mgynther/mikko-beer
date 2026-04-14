import React, { useEffect } from 'react'

import type {
  GetLocationStatsIf,
  LocationStatsSortingOrder,
  OneLocationStats,
  StatsFilters
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import LocationStatsTable from './LocationStatsTable'
import { toTimestamp } from './filter-util'

const pageSize = 30

interface Props {
  getLocationStatsIf: GetLocationStatsIf
  filters: StatsFilters
  isFiltersOpen: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
  isFilterChangePending: boolean
  sortingDirection: ListDirection
  sortingOrder: LocationStatsSortingOrder
  setSortingOrder: (order: LocationStatsSortingOrder) => void
  loadedLocations: OneLocationStats[] | undefined
  setLoadedLocations: (locations: OneLocationStats[] | undefined) => void
}

function LocationInfiniteScroll (props: Props): React.JSX.Element {
  const minReviewCount = props.filters.minReviewCount.value
  const maxReviewCount = props.filters.maxReviewCount.value
  const minReviewAverage = props.filters.minReviewAverage.value
  const maxReviewAverage = props.filters.maxReviewAverage.value
  const timeStart = props.filters.timeStart.value
  const timeEnd = props.filters.timeEnd.value
  const {
    isFilterChangePending,
    loadedLocations,
    setLoadedLocations,
    sortingOrder,
    setSortingOrder,
    sortingDirection
  } = props
  const { query, stats, isLoading: isLoadingStats } =
    props.getLocationStatsIf.useStats()
  const isLoading = isFilterChangePending || isLoadingStats

  const lastPageArray = stats?.location === undefined
    ? []
    : [...stats.location]
  const hasMore = lastPageArray.length > 0 || loadedLocations === undefined

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: undefined,
        locationId: undefined,
        styleId: undefined,
        pagination: {
          skip: loadedLocations?.length ?? 0,
          size: pageSize
        },
        sorting: {
          order: sortingOrder,
          direction: sortingDirection
        },
        minReviewCount,
        maxReviewCount,
        minReviewAverage,
        maxReviewAverage,
        timeStart: toTimestamp(timeStart, 'start'),
        timeEnd: toTimestamp(timeEnd, 'end')
      })
      const newLocations = [...(loadedLocations ?? []), ...result.location]
      setLoadedLocations(newLocations)
    }
    function checkLoad (): void {
      if (isLoading) {
        return
      }
      if (!hasMore) {
        return
      }
      void loadMore()
    }
    return props.getLocationStatsIf.infiniteScroll(checkLoad)
  }, [
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
    <LocationStatsTable
      locations={loadedLocations ?? []}
      filters={props.filters}
      isFiltersOpen={props.isFiltersOpen}
      setIsFiltersOpen={props.setIsFiltersOpen}
      isLoading={loadedLocations === undefined}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default LocationInfiniteScroll
