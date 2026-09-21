import React, { useEffect } from 'react'

import type {
  GetLocationStatsIf,
  LocationStatsSortingOrder,
  OneLocationStats,
} from '../../types/stats/types'

import { useLoadMore } from '../common/use-load-more'

import LocationStatsTable from './LocationStatsTable'
import type { StatsFilterState } from './filter-types'
import type { FormattedStatsParams } from './search-params'
import type { LinkComponent } from '../../common/link'

const pageSize = 30

interface Props {
  linkComponent: LinkComponent
  getLocationStatsIf: GetLocationStatsIf
  filterState: StatsFilterState
  isFilterChangePending: boolean
  setSortingOrder: (order: LocationStatsSortingOrder) => void
  statsParams: FormattedStatsParams<LocationStatsSortingOrder>
  loadedLocations: OneLocationStats[] | undefined
  setLoadedLocations: (
    update: (
      current: OneLocationStats[] | undefined,
    ) => OneLocationStats[] | undefined,
  ) => void
}

function LocationInfiniteScroll(props: Props): React.JSX.Element {
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
  const {
    query,
    stats,
    isLoading: isLoadingStats,
  } = props.getLocationStatsIf.useStats()
  const isLoading = isFilterChangePending || isLoadingStats

  const lastPageArray = stats?.location === undefined ? [] : [...stats.location]
  const hasMore = lastPageArray.length > 0 || loadedLocations === undefined

  const checkLoad = useLoadMore({
    hasMore,
    isLoading,
    items: loadedLocations,
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
      ).location,
    setItems: setLoadedLocations,
  })

  // Observing the end of the content reports whether it is in view, so
  // subscribing again once a page has arrived is what loads the next one
  // while the list is still shorter than the window.
  useEffect(
    () => props.getLocationStatsIf.infiniteScroll(checkLoad),
    [checkLoad, loadedLocations, isLoading, hasMore],
  )

  return (
    <LocationStatsTable
      linkComponent={props.linkComponent}
      locations={loadedLocations ?? []}
      filterState={props.filterState}
      isLoading={loadedLocations === undefined}
      sortingDirection={sortingDirection}
      sortingOrder={sortingOrder}
      setSortingOrder={setSortingOrder}
    />
  )
}

export default LocationInfiniteScroll
