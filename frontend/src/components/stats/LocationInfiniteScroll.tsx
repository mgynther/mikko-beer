import React, { useEffect } from 'react'

import type {
  GetLocationStatsIf,
  LocationStatsSortingOrder,
  OneLocationStats,
} from '../../core/stats/types'

import LocationStatsTable from './LocationStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'

const pageSize = 30

interface Props {
  getLocationStatsIf: GetLocationStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  setSortingOrder: (order: LocationStatsSortingOrder) => void
  statsParams: FormattedStatsParams<LocationStatsSortingOrder>
  loadedLocations: OneLocationStats[] | undefined
  setLoadedLocations: (locations: OneLocationStats[] | undefined) => void
}

function LocationInfiniteScroll(props: Props): React.JSX.Element {
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
    loadedLocations,
    setLoadedLocations,
    setSortingOrder,
  } = props
  const {
    query,
    stats,
    isLoading: isLoadingStats,
  } = props.getLocationStatsIf.useStats()
  const isLoading = isFilterChangePending || isLoadingStats

  const lastPageArray = stats?.location === undefined ? [] : [...stats.location]
  const hasMore = lastPageArray.length > 0 || loadedLocations === undefined

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: undefined,
        locationId: undefined,
        styleId: undefined,
        pagination: {
          skip: loadedLocations?.length ?? 0,
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
      const newLocations = [...(loadedLocations ?? []), ...result.location]
      setLoadedLocations(newLocations)
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
    query,
    timeStart,
    timeEnd,
  ])

  return (
    <LocationStatsTable
      locations={loadedLocations ?? []}
      filterState={props.filterState}
      isLoading={loadedLocations === undefined}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default LocationInfiniteScroll
