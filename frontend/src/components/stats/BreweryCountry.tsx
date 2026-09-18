import React, { useEffect, useState } from 'react'

import type {
  BreweryCountryStatsSortingOrder,
  GetBreweryCountryStatsIf,
  OneBreweryCountryStats,
} from '../../types/stats/types'

import BreweryCountryAllAtOnce from './BreweryCountryAllAtOnce'
import BreweryCountryInfiniteScroll from './BreweryCountryInfiniteScroll'
import { searchParams } from './search-params'
import type { StatsFilterState } from './filter-types'
import type { SearchParameters } from '../../types/types'

interface Props {
  getBreweryCountryStatsIf: GetBreweryCountryStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function sortingOrderOrDefault(
  search: SearchParameters | undefined,
): BreweryCountryStatsSortingOrder {
  const value = search?.get('s_order')
  return value === 'country_code' ||
    value === 'brewery_count' ||
    value === 'count' ||
    value === 'average' ||
    value === 'std_dev'
    ? value
    : 'country_code'
}

function BreweryCountry(props: Props): React.JSX.Element {
  const isAllAtOnce =
    props.breweryId !== undefined ||
    props.locationId !== undefined ||
    props.styleId !== undefined

  const { search } = props
  const parsedSearchParams = searchParams({
    nameProperty: 'country_code',
    search,
    minTime: props.getBreweryCountryStatsIf.minTime,
    maxTime: props.getBreweryCountryStatsIf.maxTime,
    getUseDebounce: props.getBreweryCountryStatsIf.getUseDebounce,
    sortingOrderParser: sortingOrderOrDefault,
    setState: (state) => props.setState({ ...state }),
  })
  const [loadedBreweryCountries, setLoadedBreweryCountries] = useState<
    OneBreweryCountryStats[] | undefined
  >(undefined)

  useEffect(() => {
    setLoadedBreweryCountries(undefined)
  }, [parsedSearchParams.changeDetectionString])

  const filterState: StatsFilterState = {
    filters: parsedSearchParams.filters,
    isOpen: parsedSearchParams.statsParams.isFiltersOpen,
    setIsOpen: parsedSearchParams.setIsFiltersOpen,
  }

  return (
    <>
      {isAllAtOnce && (
        <BreweryCountryAllAtOnce
          getBreweryCountryStatsIf={props.getBreweryCountryStatsIf}
          filterState={filterState}
          isFilterChangePending={parsedSearchParams.isFilterChangePending}
          loadedBreweryCountries={loadedBreweryCountries}
          setLoadedBreweryCountries={setLoadedBreweryCountries}
          setSortingOrder={parsedSearchParams.changeSortingOrder}
          statsParams={parsedSearchParams.statsParams}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      )}
      {!isAllAtOnce && (
        <BreweryCountryInfiniteScroll
          getBreweryCountryStatsIf={props.getBreweryCountryStatsIf}
          filterState={filterState}
          isFilterChangePending={parsedSearchParams.isFilterChangePending}
          loadedBreweryCountries={loadedBreweryCountries}
          setLoadedBreweryCountries={setLoadedBreweryCountries}
          setSortingOrder={parsedSearchParams.changeSortingOrder}
          statsParams={parsedSearchParams.statsParams}
        />
      )}
    </>
  )
}

export default BreweryCountry
