import React, { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
  StatsFilters
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import BreweryStatsTable from './BreweryStatsTable'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  filters: StatsFilters
  isFiltersOpen: boolean
  setIsFiltersOpen: (isOpen: boolean) => void
  sortingDirection: ListDirection
  sortingOrder: BreweryStatsSortingOrder
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  loadedBreweries: OneBreweryStats[] | undefined
  setLoadedBreweries: (breweries: OneBreweryStats[] | undefined) => void
}

const giantPage = {
  skip: 0,
  size: 10000
}

function BreweryAllAtOnce (props: Props): React.JSX.Element {
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
  const { query, isLoading } = props.getBreweryStatsIf.useStats()
  const { breweryId, locationId, styleId } = props

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [breweryId, locationId, styleId])

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
      setLoadedBreweries([...result.brewery])
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
    <BreweryStatsTable
      breweries={loadedBreweries ?? []}
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

export default BreweryAllAtOnce
