import React, { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
} from '../../core/stats/types'
import type { ListDirection } from '../../core/types'

import BreweryStatsTable from './BreweryStatsTable'
import { formatYearMonth, toTimestamp } from '../common/filter-util'
import type { StatsFilterState } from './filter-types'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
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
  size: 10000,
}

function BreweryAllAtOnce(props: Props): React.JSX.Element {
  const { filters } = props.filterState
  const minReviewCount = filters.minReviewCount.value
  const maxReviewCount = filters.maxReviewCount.value
  const minReviewAverage = filters.minReviewAverage.value
  const maxReviewAverage = filters.maxReviewAverage.value
  const timeStart = filters.timeStart.value
  const timeEnd = filters.timeEnd.value
  const {
    isFilterChangePending,
    loadedBreweries,
    setLoadedBreweries,
    sortingOrder,
    setSortingOrder,
    sortingDirection,
  } = props
  const { query, isLoading: isLoadingStats } =
    props.getBreweryStatsIf.useStats()
  const isLoading =
    isFilterChangePending || isLoadingStats || loadedBreweries === undefined
  const { breweryId, locationId, styleId } = props

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [breweryId, locationId, styleId])

  useEffect(() => {
    if (isFilterChangePending) {
      setLoadedBreweries(undefined)
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
    maxReviewAverage,
    formatYearMonth(timeStart),
    formatYearMonth(timeEnd),
  ])

  function getBreweries(): OneBreweryStats[] {
    if (loadedBreweries === undefined) {
      return []
    }
    if (isLoading) {
      return []
    }
    return loadedBreweries
  }
  return (
    <BreweryStatsTable
      breweries={getBreweries()}
      filterState={props.filterState}
      isLoading={isLoading}
      sortingDirection={props.sortingDirection}
      sortingOrder={props.sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryAllAtOnce
