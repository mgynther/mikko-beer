import React, { useState } from 'react'

import type {
  LocationStatsSortingOrder,
  GetLocationStatsIf,
  OneLocationStats
} from '../../core/stats/types'

import { invertDirection } from '../list-helpers'

import LocationAllAtOnce from './LocationAllAtOnce'
import LocationInfiniteScroll from './LocationInfiniteScroll'
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
  getLocationStatsIf: GetLocationStatsIf
  breweryId: string | undefined
  search: SearchParameters
  setState: (state: Record<string, string>) => void
  styleId: string | undefined
}

function sortingOrderOrDefault (
  search: SearchParameters
): LocationStatsSortingOrder {
  const value = search.get('sorting_order')
  return value === 'location_name' || value === 'count' || value === 'average'
    ? value : 'location_name'
}

function Location (props: Props): React.JSX.Element {
  const isAllAtOnce =
    props.breweryId !== undefined || props.styleId !== undefined

  const { search } = props
  const sortingOrder = sortingOrderOrDefault(search)
  const sortingDirection = listDirectionOrDefault(search)
  const minReviewCount = filterNumOrDefault('min_review_count', search)
  const maxReviewCount = filterNumOrDefault('max_review_count', search)
  const minReviewAverage = filterNumOrDefault('min_review_average', search)
  const maxReviewAverage = filterNumOrDefault('max_review_average', search)
  const isFiltersOpen = filtersOpenOrDefault(search)
  const [loadedLocations, setLoadedLocations] =
    useState<OneLocationStats[] | undefined>(undefined)

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
      setLoadedLocations(undefined)
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

  function changeSortingOrder (property: LocationStatsSortingOrder): void {
    setLoadedLocations(undefined)
    if (sortingOrder === property) {
      props.setState({
        ...getCurrentState(),
        list_direction: invertDirection(sortingDirection)
      })
      return
    }
    const direction = property === 'location_name' ? 'asc' : 'desc'
    props.setState({
      ...getCurrentState(),
      sorting_order: property,
      list_direction: direction
    })
  }

  return (
    <>
      {isAllAtOnce && (
        <LocationAllAtOnce
          getLocationStatsIf={props.getLocationStatsIf}
          filters={filters}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          loadedLocations={loadedLocations}
          setLoadedLocations={setLoadedLocations}
          sortingDirection={sortingDirection}
          sortingOrder={sortingOrder}
          setSortingOrder={changeSortingOrder}
          breweryId={props.breweryId}
          styleId={props.styleId}
        />
      )}
      {!isAllAtOnce && (
        <LocationInfiniteScroll
          getLocationStatsIf={props.getLocationStatsIf}
          filters={filters}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          loadedLocations={loadedLocations}
          setLoadedLocations={setLoadedLocations}
          sortingDirection={sortingDirection}
          sortingOrder={sortingOrder}
          setSortingOrder={changeSortingOrder}
        />
      )}
    </>
  )
}

export default Location
