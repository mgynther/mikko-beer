import React, { useEffect } from 'react'

import type {
  GetLocationStatsIf,
  LocationStatsSortingOrder,
  OneLocationStats,
  StatsFilters
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import LocationStatsTable from './LocationStatsTable'

interface Props {
  getLocationStatsIf: GetLocationStatsIf
  filters: StatsFilters
  isFiltersOpen: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
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
  size: 10000
}

function LocationAllAtOnce (props: Props): React.JSX.Element {
  const minReviewCount = props.filters.minReviewCount.value
  const maxReviewCount = props.filters.maxReviewCount.value
  const minReviewAverage = props.filters.minReviewAverage.value
  const maxReviewAverage = props.filters.maxReviewAverage.value
  const {
    loadedLocations,
    setLoadedLocations,
    sortingOrder,
    setSortingOrder,
    sortingDirection
  } = props
  const { query, isLoading } = props.getLocationStatsIf.useStats()
  const { breweryId, locationId, styleId } = props

  useEffect(() => {
    setLoadedLocations(undefined)
  }, [breweryId])

  useEffect(() => {
    setLoadedLocations(undefined)
  }, [styleId])

  useEffect(() => {
    async function loadAll (): Promise<void> {
      const result = await query({
        breweryId,
        locationId,
        styleId,
        pagination: giantPage,
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
    maxReviewAverage
  ])

  return (
    <LocationStatsTable
      locations={loadedLocations ?? []}
      filters={props.filters}
      isFiltersOpen={props.isFiltersOpen}
      setIsFiltersOpen={props.setIsFiltersOpen}
      isLoading={isLoading}
      sortingDirection={props.sortingDirection}
      sortingOrder={props.sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default LocationAllAtOnce
