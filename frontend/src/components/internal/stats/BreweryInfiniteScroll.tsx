import React, { useEffect } from 'react'

import type {
  GetBreweryStatsIf,
  BreweryStatsSortingOrder,
  OneBreweryStats,
} from '../../types/stats/types'

import { useLoadMore } from '../common/use-load-more'

import BreweryStatsTable from './BreweryStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'
import type { LinkComponent } from '../../common/link'

const pageSize = 30

interface Props {
  linkComponent: LinkComponent
  getBreweryStatsIf: GetBreweryStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  setSortingOrder: (order: BreweryStatsSortingOrder) => void
  statsParams: FormattedStatsParams<BreweryStatsSortingOrder>
  loadedBreweries: OneBreweryStats[] | undefined
  setLoadedBreweries: (
    update: (
      current: OneBreweryStats[] | undefined,
    ) => OneBreweryStats[] | undefined,
  ) => void
}

function BreweryInfiniteScroll(props: Props): React.JSX.Element {
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
  const {
    query,
    stats,
    isLoading: isLoadingStats,
  } = props.getBreweryStatsIf.useStats()
  const isLoading = isFilterChangePending || isLoadingStats

  const lastPageArray = stats?.brewery === undefined ? [] : [...stats.brewery]
  const hasMore = lastPageArray.length > 0 || loadedBreweries === undefined

  const checkLoad = useLoadMore({
    hasMore,
    isLoading,
    items: loadedBreweries,
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
      ).brewery,
    setItems: setLoadedBreweries,
  })

  // Observing the end of the content reports whether it is in view, so
  // subscribing again once a page has arrived is what loads the next one
  // while the list is still shorter than the window.
  useEffect(
    () => props.getBreweryStatsIf.infiniteScroll(checkLoad),
    [checkLoad, loadedBreweries, isLoading, hasMore],
  )

  return (
    <BreweryStatsTable
      linkComponent={props.linkComponent}
      breweries={loadedBreweries ?? []}
      filterState={props.filterState}
      isLoading={loadedBreweries === undefined}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default BreweryInfiniteScroll
