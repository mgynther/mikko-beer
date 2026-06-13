import React, { useEffect, useState } from 'react'

import type {
  BreweryStatsSortingOrder,
  GetBreweryStatsIf,
  OneBreweryStats,
} from '../../core/stats/types'

import BreweryAllAtOnce from './BreweryAllAtOnce'
import BreweryInfiniteScroll from './BreweryInfiniteScroll'
import type { SearchParameters } from '../util'
import { searchParams } from './search-params'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function sortingOrderOrDefault(
  search: SearchParameters | undefined,
): BreweryStatsSortingOrder {
  const value = search?.get('s_order')
  return value === 'brewery_name' ||
    value === 'count' ||
    value === 'average' ||
    value === 'std_dev'
    ? value
    : 'brewery_name'
}

function Brewery(props: Props): React.JSX.Element {
  const isAllAtOnce =
    props.breweryId !== undefined ||
    props.locationId !== undefined ||
    props.styleId !== undefined

  const { search } = props
  const parsedSearchParams = searchParams({
    nameProperty: 'brewery_name',
    search,
    minTime: props.getBreweryStatsIf.minTime,
    maxTime: props.getBreweryStatsIf.maxTime,
    getUseDebounce: props.getBreweryStatsIf.getUseDebounce,
    sortingOrderParser: sortingOrderOrDefault,
    setState: (state) => props.setState({ ...state }),
  })
  const [loadedBreweries, setLoadedBreweries] = useState<
    OneBreweryStats[] | undefined
  >(undefined)

  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [parsedSearchParams.searchString])

  return (
    <>
      {isAllAtOnce && (
        <BreweryAllAtOnce
          getBreweryStatsIf={props.getBreweryStatsIf}
          filters={parsedSearchParams.filters}
          isFiltersOpen={parsedSearchParams.statsParams.isFiltersOpen}
          setIsFiltersOpen={parsedSearchParams.setIsFiltersOpen}
          isFilterChangePending={parsedSearchParams.isFilterChangePending}
          loadedBreweries={loadedBreweries}
          setLoadedBreweries={setLoadedBreweries}
          sortingDirection={parsedSearchParams.statsParams.sortingDirection}
          sortingOrder={parsedSearchParams.statsParams.sortingOrder}
          setSortingOrder={parsedSearchParams.changeSortingOrder}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      )}
      {!isAllAtOnce && (
        <BreweryInfiniteScroll
          getBreweryStatsIf={props.getBreweryStatsIf}
          filters={parsedSearchParams.filters}
          isFiltersOpen={parsedSearchParams.statsParams.isFiltersOpen}
          isFilterChangePending={parsedSearchParams.isFilterChangePending}
          setIsFiltersOpen={parsedSearchParams.setIsFiltersOpen}
          loadedBreweries={loadedBreweries}
          setLoadedBreweries={setLoadedBreweries}
          sortingDirection={parsedSearchParams.statsParams.sortingDirection}
          sortingOrder={parsedSearchParams.statsParams.sortingOrder}
          setSortingOrder={parsedSearchParams.changeSortingOrder}
        />
      )}
    </>
  )
}

export default Brewery
