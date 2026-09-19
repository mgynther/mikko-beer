import React, { useEffect } from 'react'

import type {
  GetBreweryCountryStatsIf,
  BreweryCountryStatsSortingOrder,
  OneBreweryCountryStats,
} from '../../types/stats/types'

import BreweryCountryStatsTable from './BreweryCountryStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'

const pageSize = 30

interface Props {
  getBreweryCountryStatsIf: GetBreweryCountryStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  setSortingOrder: (order: BreweryCountryStatsSortingOrder) => void
  statsParams: FormattedStatsParams<BreweryCountryStatsSortingOrder>
  loadedBreweryCountries: OneBreweryCountryStats[] | undefined
  setLoadedBreweryCountries: (
    breweryCountries: OneBreweryCountryStats[] | undefined,
  ) => void
}

function BreweryCountryInfiniteScroll(props: Props): React.JSX.Element {
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
  const {
    query,
    stats,
    isLoading: isLoadingStats,
  } = props.getBreweryCountryStatsIf.useStats()
  const isLoading = isFilterChangePending || isLoadingStats

  const lastPageArray =
    stats?.breweryCountry === undefined ? [] : [...stats.breweryCountry]
  const hasMore =
    lastPageArray.length > 0 || loadedBreweryCountries === undefined

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: undefined,
        locationId: undefined,
        styleId: undefined,
        pagination: {
          skip: loadedBreweryCountries?.length ?? 0,
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
      const newBreweryCountries = [
        ...(loadedBreweryCountries ?? []),
        ...result.breweryCountry,
      ]
      setLoadedBreweryCountries(newBreweryCountries)
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
    return props.getBreweryCountryStatsIf.infiniteScroll(checkLoad)
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
    <BreweryCountryStatsTable
      breweryCountries={loadedBreweryCountries ?? []}
      filterState={props.filterState}
      isLoading={loadedBreweryCountries === undefined}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryCountryInfiniteScroll
