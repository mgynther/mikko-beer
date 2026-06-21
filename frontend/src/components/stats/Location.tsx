import React, { useEffect, useState } from 'react'

import type {
  LocationStatsSortingOrder,
  GetLocationStatsIf,
  OneLocationStats,
} from '../../core/stats/types'

import LocationAllAtOnce from './LocationAllAtOnce'
import LocationInfiniteScroll from './LocationInfiniteScroll'
import { searchParams } from './search-params'
import type { StatsFilterState } from './filter-types'
import type { SearchParameters } from '../../core/types'

interface Props {
  getLocationStatsIf: GetLocationStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function sortingOrderOrDefault(
  search: SearchParameters | undefined,
): LocationStatsSortingOrder {
  const value = search?.get('s_order')
  return value === 'location_name' ||
    value === 'count' ||
    value === 'average' ||
    value === 'std_dev'
    ? value
    : 'location_name'
}

function Location(props: Props): React.JSX.Element {
  const isAllAtOnce =
    props.breweryId !== undefined ||
    props.locationId !== undefined ||
    props.styleId !== undefined

  const { search } = props
  const parsedSearchParams = searchParams({
    nameProperty: 'location_name',
    search,
    minTime: props.getLocationStatsIf.minTime,
    maxTime: props.getLocationStatsIf.maxTime,
    getUseDebounce: props.getLocationStatsIf.getUseDebounce,
    sortingOrderParser: sortingOrderOrDefault,
    setState: (state) => props.setState({ ...state }),
  })
  const [loadedLocations, setLoadedLocations] = useState<
    OneLocationStats[] | undefined
  >(undefined)

  useEffect(() => {
    setLoadedLocations(undefined)
  }, [parsedSearchParams.changeDetectionString])

  const filterState: StatsFilterState = {
    filters: parsedSearchParams.filters,
    isOpen: parsedSearchParams.statsParams.isFiltersOpen,
    setIsOpen: parsedSearchParams.setIsFiltersOpen,
  }

  return (
    <>
      {isAllAtOnce && (
        <LocationAllAtOnce
          getLocationStatsIf={props.getLocationStatsIf}
          filterState={filterState}
          isFilterChangePending={parsedSearchParams.isFilterChangePending}
          loadedLocations={loadedLocations}
          setLoadedLocations={setLoadedLocations}
          setSortingOrder={parsedSearchParams.changeSortingOrder}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
          statsParams={parsedSearchParams.statsParams}
        />
      )}
      {!isAllAtOnce && (
        <LocationInfiniteScroll
          getLocationStatsIf={props.getLocationStatsIf}
          filterState={filterState}
          isFilterChangePending={parsedSearchParams.isFilterChangePending}
          loadedLocations={loadedLocations}
          setLoadedLocations={setLoadedLocations}
          setSortingOrder={parsedSearchParams.changeSortingOrder}
          statsParams={parsedSearchParams.statsParams}
        />
      )}
    </>
  )
}

export default Location
