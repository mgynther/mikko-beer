import React, { useEffect, useState } from 'react'

import type {
  BreweryStatsSortingOrder,
  GetBreweryStatsIf,
  OneBreweryStats
} from '../../core/stats/types'

import { invertDirection } from '../list-helpers'

import BreweryAllAtOnce from './BreweryAllAtOnce'
import BreweryInfiniteScroll from './BreweryInfiniteScroll'
import type { SearchParameters } from '../util'
import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault,
  filtersOpenOrDefault,
  filtersOpenStr
} from './filter-util'

interface Props {
  getBreweryStatsIf: GetBreweryStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function sortingOrderOrDefault (
  search: SearchParameters
): BreweryStatsSortingOrder {
  const value = search.get('sorting_order')
  return value === 'brewery_name' || value === 'count' || value === 'average'
    ? value : 'brewery_name'
}

function Brewery (props: Props): React.JSX.Element {
  const isAllAtOnce = props.breweryId !== undefined
    || props.locationId !== undefined
    || props.styleId !== undefined

  const { search } = props
  const sortingOrder = sortingOrderOrDefault(search)
  const sortingDirection = listDirectionOrDefault(search)
  const minReviewCount = filterNumOrDefault('min_review_count', search)
  const maxReviewCount = filterNumOrDefault('max_review_count', search)
  const minReviewAverage = filterNumOrDefault('min_review_average', search)
  const maxReviewAverage = filterNumOrDefault('max_review_average', search)
  const isFiltersOpen = filtersOpenOrDefault(search)
  const [loadedBreweries, setLoadedBreweries] =
    useState<OneBreweryStats[] | undefined>(undefined)

  function getCurrentState(): Record<string, string> {
    const currentState: Record<string, string> = {
      min_review_count: countStr(minReviewCount),
      max_review_count: countStr(maxReviewCount),
      min_review_average: averageStr(minReviewAverage),
      max_review_average: averageStr(maxReviewAverage),
      sorting_order: sortingOrder,
      list_direction: sortingDirection,
      filters_open: filtersOpenStr(isFiltersOpen)
    }
    return currentState
  }

  function getFilterSetter(
    key: string,
    converter: (value: number) => string
  ) {
    return (value: number) => {
      const newState: Record<string, string> = getCurrentState()
      newState[key] = converter(value)
      props.setState(newState)
    }
  }

  const setMinReviewCount = getFilterSetter('min_review_count', countStr)
  const setMaxReviewCount = getFilterSetter('max_review_count', countStr)
  const setMinReviewAverage = getFilterSetter('min_review_average', averageStr)
  const setMaxReviewAverage = getFilterSetter('max_review_average', averageStr)

  function setIsFiltersOpen (isOpen: boolean): void {
    const newState: Record<string, string> = getCurrentState()
    newState.filters_open = filtersOpenStr(isOpen)
    props.setState(newState)
  }

  const filters = {
    minReviewCount: {
      value: minReviewCount,
      setValue: setMinReviewCount
    },
    maxReviewCount: {
      value: maxReviewCount,
      setValue: setMaxReviewCount
    },
    minReviewAverage: {
      value: minReviewAverage,
      setValue: setMinReviewAverage
    },
    maxReviewAverage: {
      value: maxReviewAverage,
      setValue: setMaxReviewAverage
    }
  }

  const searchString = JSON.stringify({
    filters,
    sortingDirection,
    sortingOrder
  })
  useEffect(() => {
    setLoadedBreweries(undefined)
  }, [searchString])

  function changeSortingOrder (property: BreweryStatsSortingOrder): void {
    if (sortingOrder === property) {
      props.setState({
        ...getCurrentState(),
        list_direction: invertDirection(sortingDirection)
      })
      return
    }
    const direction = property === 'brewery_name' ? 'asc' : 'desc'
    props.setState({
      ...getCurrentState(),
      sorting_order: property,
      list_direction: direction
    })
  }

  return (
    <>
      {isAllAtOnce && (
        <BreweryAllAtOnce
          getBreweryStatsIf={props.getBreweryStatsIf}
          filters={filters}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          loadedBreweries={loadedBreweries}
          setLoadedBreweries={setLoadedBreweries}
          sortingDirection={sortingDirection}
          sortingOrder={sortingOrder}
          setSortingOrder={changeSortingOrder}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      )}
      {!isAllAtOnce && (
        <BreweryInfiniteScroll
          getBreweryStatsIf={props.getBreweryStatsIf}
          filters={filters}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          loadedBreweries={loadedBreweries}
          setLoadedBreweries={setLoadedBreweries}
          sortingDirection={sortingDirection}
          sortingOrder={sortingOrder}
          setSortingOrder={changeSortingOrder}
        />
      )}
    </>
  )
}

export default Brewery
