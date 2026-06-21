import React, { useEffect } from 'react'

import type {
  GetLocationStatsIf,
  LocationStatsSortingOrder,
  OneLocationStats,
} from '../../core/stats/types'

import LocationStatsTable from './LocationStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'

interface Props {
  getLocationStatsIf: GetLocationStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  statsParams: FormattedStatsParams<LocationStatsSortingOrder>
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
        timeStart,
        timeEnd,
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
    timeStart,
    timeEnd,
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
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default LocationAllAtOnce
