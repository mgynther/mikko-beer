import React, { useEffect } from 'react'

import type {
  GetLocationStatsIf,
  LocationStatsSortingOrder,
  OneLocationStats,
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import LocationStatsTable from './LocationStatsTable'
import { formatYearMonth, toTimestamp } from '../common/filter-util'
import type { StatsFilterState } from './filter-types'

interface Props {
  getLocationStatsIf: GetLocationStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  sortingDirection: ListDirection
  sortingOrder: LocationStatsSortingOrder
  setSortingOrder: (order: LocationStatsSortingOrder) => void
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  loadedLocations: OneLocationStats[] | undefined
  setLoadedLocations: (locations: OneLocationStats[] | undefined) => void
}

const giantPage = {
  skip: 0,
  size: 10000,
}

function LocationAllAtOnce(props: Props): React.JSX.Element {
  const { filters } = props.filterState
  const minReviewCount = filters.minReviewCount.value
  const maxReviewCount = filters.maxReviewCount.value
  const minReviewAverage = filters.minReviewAverage.value
  const maxReviewAverage = filters.maxReviewAverage.value
  const timeStart = filters.timeStart.value
  const timeEnd = filters.timeEnd.value
  const {
    isFilterChangePending,
    loadedLocations,
    setLoadedLocations,
    sortingOrder,
    setSortingOrder,
    sortingDirection,
  } = props
  const { query, isLoading: isLoadingStats } =
    props.getLocationStatsIf.useStats()
  const isLoading =
    isFilterChangePending || isLoadingStats || loadedLocations === undefined
  const { breweryId, locationId, styleId } = props

  useEffect(() => {
    setLoadedLocations(undefined)
  }, [breweryId, locationId, styleId])

  useEffect(() => {
    if (isFilterChangePending) {
      setLoadedLocations(undefined)
    }
  }, [isFilterChangePending])

  useEffect(() => {
    async function loadAll(): Promise<void> {
      const result = await query({
        breweryId,
        locationId,
        styleId,
        pagination: giantPage,
        sorting: {
          order: sortingOrder,
          direction: sortingDirection,
        },
        minReviewCount,
        maxReviewCount,
        minReviewAverage,
        maxReviewAverage,
        timeStart: toTimestamp(timeStart, 'start'),
        timeEnd: toTimestamp(timeEnd, 'end'),
      })
      setLoadedLocations([...result.location])
    }
    void loadAll()
  }, [
    breweryId,
    locationId,
    styleId,
    sortingOrder,
    sortingDirection,
    minReviewCount,
    maxReviewCount,
    minReviewAverage,
    maxReviewAverage,
    formatYearMonth(timeStart),
    formatYearMonth(timeEnd),
  ])

  function getLocations(): OneLocationStats[] {
    if (loadedLocations === undefined) {
      return []
    }
    if (isLoading) {
      return []
    }
    return loadedLocations
  }
  return (
    <LocationStatsTable
      locations={getLocations()}
      filterState={props.filterState}
      isLoading={isLoading}
      sortingDirection={props.sortingDirection}
      sortingOrder={props.sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default LocationAllAtOnce
