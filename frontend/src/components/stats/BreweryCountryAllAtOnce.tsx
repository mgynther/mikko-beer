import React, { useEffect } from 'react'

import type {
  GetBreweryCountryStatsIf,
  BreweryCountryStatsSortingOrder,
  OneBreweryCountryStats,
} from '../../types/stats/types'

import BreweryCountryStatsTable from './BreweryCountryStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'

interface Props {
  getBreweryCountryStatsIf: GetBreweryCountryStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  statsParams: FormattedStatsParams<BreweryCountryStatsSortingOrder>
  setSortingOrder: (order: BreweryCountryStatsSortingOrder) => void
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  loadedBreweryCountries: OneBreweryCountryStats[] | undefined
  setLoadedBreweryCountries: (
    breweryCountries: OneBreweryCountryStats[] | undefined,
  ) => void
}

const giantPage = {
  skip: 0,
  size: 10000,
}

function BreweryCountryAllAtOnce(props: Props): React.JSX.Element {
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
    loadedBreweryCountries,
    setLoadedBreweryCountries,
    setSortingOrder,
  } = props
  const { query, isLoading: isLoadingStats } =
    props.getBreweryCountryStatsIf.useStats()
  const isLoading =
    isFilterChangePending ||
    isLoadingStats ||
    loadedBreweryCountries === undefined
  const { breweryId, locationId, styleId } = props

  useEffect(() => {
    setLoadedBreweryCountries(undefined)
  }, [breweryId, locationId, styleId])

  useEffect(() => {
    if (isFilterChangePending) {
      setLoadedBreweryCountries(undefined)
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
      setLoadedBreweryCountries([...result.breweryCountry])
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

  function getBreweryCountries(): OneBreweryCountryStats[] {
    if (loadedBreweryCountries === undefined) {
      return []
    }
    if (isLoading) {
      return []
    }
    return loadedBreweryCountries
  }
  return (
    <BreweryCountryStatsTable
      breweryCountries={getBreweryCountries()}
      filterState={props.filterState}
      isLoading={isLoading}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryCountryAllAtOnce
