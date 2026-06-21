import React, { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
} from '../../core/stats/types'

import BreweryStatsTable from './BreweryStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  statsParams: FormattedStatsParams<BreweryStatsSortingOrder>
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
        timeStart,
        timeEnd,
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
    timeStart,
    timeEnd,
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
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryAllAtOnce
