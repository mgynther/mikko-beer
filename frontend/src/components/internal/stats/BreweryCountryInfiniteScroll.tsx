import React, { useEffect } from 'react'

import type {
  GetBreweryCountryStatsIf,
  BreweryCountryStatsSortingOrder,
  OneBreweryCountryStats,
} from '../../types/stats/types'

import { useLoadMore } from '../common/use-load-more'

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
    update: (
      current: OneBreweryCountryStats[] | undefined,
    ) => OneBreweryCountryStats[] | undefined,
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

  const checkLoad = useLoadMore({
    hasMore,
    isLoading,
    items: loadedBreweryCountries,
    loadPage: async (skip: number) =>
      (
        await query({
          breweryId: undefined,
          locationId: undefined,
          styleId: undefined,
          pagination: { skip, size: pageSize },
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
      ).breweryCountry,
    setItems: setLoadedBreweryCountries,
  })

  // Observing the end of the content reports whether it is in view, so
  // subscribing again once a page has arrived is what loads the next one
  // while the list is still shorter than the window.
  useEffect(
    () => props.getBreweryCountryStatsIf.infiniteScroll(checkLoad),
    [checkLoad, loadedBreweryCountries, isLoading, hasMore],
  )

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
